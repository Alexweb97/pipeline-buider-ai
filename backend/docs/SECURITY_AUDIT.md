# Security Audit Report - Red Team Analysis

## 🔴 Red Team Security Assessment

Analyse de sécurité du système d'authentification d'un point de vue "attaquant".

---

## ⚠️ Vulnérabilités Identifiées

### 🔴 CRITIQUE - À corriger immédiatement

#### 1. **Absence de Rate Limiting**
**Risque:** Brute Force Attack sur `/auth/login`

**Scénario d'attaque:**
```python
# Un attaquant peut tenter des milliers de combinaisons
for password in password_list:
    requests.post('/api/v1/auth/login', json={
        'username': 'admin@example.com',
        'password': password
    })
```

**Impact:** Compromission de comptes utilisateurs

**Solution recommandée:**
```python
# Utiliser slowapi ou fastapi-limiter
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/login")
@limiter.limit("5/minute")  # Max 5 tentatives par minute
def login(...):
    pass
```

**Priorité:** 🔴 CRITIQUE

---

#### 2. **Pas de Blacklist de Tokens**
**Risque:** Tokens volés restent valides après logout

**Scénario d'attaque:**
```
1. Attaquant intercepte un token JWT (XSS, MITM, etc.)
2. Victime se déconnecte
3. Token reste valide pendant 30 minutes
4. Attaquant peut toujours accéder aux ressources
```

**Impact:** Session hijacking

**Solution recommandée:**
```python
# Implémenter un token blacklist avec Redis
from redis import Redis

redis_client = Redis(host='localhost', port=6379, db=0)

def blacklist_token(token: str, expiry: int):
    """Add token to blacklist"""
    redis_client.setex(f"blacklist:{token}", expiry, "1")

def is_token_blacklisted(token: str) -> bool:
    """Check if token is blacklisted"""
    return redis_client.exists(f"blacklist:{token}") == 1

# Dans get_current_user
def get_current_user(...):
    token = credentials.credentials
    if is_token_blacklisted(token):
        raise HTTPException(status_code=401, detail="Token has been revoked")
    # ... rest of validation
```

**Priorité:** 🔴 CRITIQUE

---

#### 3. **Secret Keys en Clair dans .env**
**Risque:** Exposure des secrets en cas de compromission du repository

**Scénario d'attaque:**
```bash
# Attaquant accède au repo (mauvaise config Git, leak, etc.)
cat backend/.env
# SECRET_KEY=dev-secret-key-change-in-production-min-32-chars-long
# Peut maintenant forger des tokens JWT valides
```

**Impact:** Compromission totale du système

**Solution recommandée:**
```bash
# Utiliser des secrets managers
# AWS Secrets Manager, HashiCorp Vault, Azure Key Vault

# Ou au minimum, ne JAMAIS commit .env
echo ".env" >> .gitignore

# Utiliser des variables d'environnement système
export SECRET_KEY=$(openssl rand -hex 32)
export ENCRYPTION_KEY=$(openssl rand -base64 32)
```

**Priorité:** 🔴 CRITIQUE

---

### 🟠 ÉLEVÉ - À corriger rapidement

#### 4. **Pas de Protection CSRF**
**Risque:** Cross-Site Request Forgery

**Scénario d'attaque:**
```html
<!-- Attaquant héberge cette page -->
<form action="https://your-api.com/api/v1/auth/logout" method="POST">
    <input type="hidden" name="token" value="stolen_token">
</form>
<script>document.forms[0].submit();</script>
```

**Solution recommandée:**
```python
# Ajouter CSRF protection pour les cookies
from fastapi_csrf_protect import CsrfProtect

# Ou utiliser SameSite cookies
response.set_cookie(
    "access_token",
    value=token,
    httponly=True,
    secure=True,
    samesite="strict"
)
```

**Priorité:** 🟠 ÉLEVÉ

---

#### 5. **Énumération d'Utilisateurs**
**Risque:** Un attaquant peut déterminer si un email/username existe

**Scénario d'attaque:**
```python
# Register endpoint révèle si l'email existe
response = requests.post('/auth/register', json={
    'email': 'target@example.com',
    'username': 'test',
    'password': 'Test123'
})

if "Email already registered" in response.text:
    print("✓ Email existe dans la base")
```

**Solution recommandée:**
```python
# Messages d'erreur génériques
@router.post("/register")
def register(...):
    existing = db.query(User).filter(
        (User.email == user_data.email) |
        (User.username == user_data.username)
    ).first()

    if existing:
        # Message générique
        raise HTTPException(
            status_code=400,
            detail="This account information is already in use"
        )
```

**Priorité:** 🟠 ÉLEVÉ

---

#### 6. **Timing Attack sur Login**
**Risque:** Un attaquant peut déduire si un username existe via le temps de réponse

**Scénario d'attaque:**
```python
import time

# Username qui existe prend plus de temps (bcrypt verify)
start = time.time()
login(username="existing_user", password="wrong")
existing_time = time.time() - start  # ~100ms (bcrypt)

# Username inexistant est plus rapide
start = time.time()
login(username="nonexistent", password="wrong")
nonexistent_time = time.time() - start  # ~1ms (pas de bcrypt)
```

**Solution recommandée:**
```python
@router.post("/login")
def login(...):
    user = db.query(User).filter(...).first()

    # TOUJOURS vérifier le password, même si user n'existe pas
    if not user:
        # Hash un password fictif pour maintenir le timing constant
        verify_password("dummy_password", hash_password("dummy"))
        raise HTTPException(...)

    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(...)
```

**Priorité:** 🟠 ÉLEVÉ

---

### 🟡 MOYEN - À améliorer

#### 7. **Pas de Limitation de Tentatives par Compte**
**Risque:** Account lockout DoS

**Solution recommandée:**
```python
# Bloquer le compte après X tentatives échouées
class User(Base):
    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0)
    locked_until: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

def login(...):
    if user.locked_until and user.locked_until > datetime.utcnow():
        raise HTTPException(403, "Account temporarily locked")

    if not verify_password(...):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= 5:
            user.locked_until = datetime.utcnow() + timedelta(minutes=15)
        db.commit()
        raise HTTPException(401, ...)

    # Reset sur login réussi
    user.failed_login_attempts = 0
    user.locked_until = None
```

**Priorité:** 🟡 MOYEN

---

#### 8. **Tokens JWT trop longs**
**Risque:** Information disclosure via token inspection

**Problème actuel:**
```javascript
// Token contient email et role en clair (base64)
{
  "sub": "user-uuid",
  "email": "admin@company.com",  // ⚠️ PII exposure
  "role": "admin",                // ⚠️ Privilege disclosure
  "exp": 1234567890
}
```

**Solution recommandée:**
```python
# Minimiser les données dans le token
token_data = {
    "sub": str(user.id),  # Seulement l'ID
    # email et role seront récupérés de la DB si nécessaire
}
```

**Priorité:** 🟡 MOYEN

---

#### 9. **Pas de Logging d'Audit**
**Risque:** Impossible de détecter/investiguer une intrusion

**Solution recommandée:**
```python
import logging

audit_logger = logging.getLogger("audit")

@router.post("/login")
def login(...):
    try:
        # ... authentication logic
        audit_logger.info(
            "Login successful",
            extra={
                "user_id": user.id,
                "ip": request.client.host,
                "user_agent": request.headers.get("user-agent"),
                "timestamp": datetime.utcnow()
            }
        )
    except HTTPException:
        audit_logger.warning(
            "Login failed",
            extra={
                "username": credentials.username,
                "ip": request.client.host,
                "reason": "invalid_credentials"
            }
        )
        raise
```

**Priorité:** 🟡 MOYEN

---

#### 10. **Pas de Validation d'Email**
**Risque:** Spam, comptes fictifs

**Solution recommandée:**
```python
from itsdangerous import URLSafeTimedSerializer

def generate_verification_token(email: str) -> str:
    serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
    return serializer.dumps(email, salt="email-verification")

@router.post("/verify-email/{token}")
def verify_email(token: str, db: Session = Depends(get_db)):
    try:
        serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
        email = serializer.loads(token, salt="email-verification", max_age=3600)

        user = db.query(User).filter(User.email == email).first()
        user.email_verified = True
        db.commit()

        return {"message": "Email verified"}
    except:
        raise HTTPException(400, "Invalid or expired token")
```

**Priorité:** 🟡 MOYEN

---

### 🟢 BAS - Nice to have

#### 11. **Pas de 2FA (Two-Factor Authentication)**
**Solution recommandée:** Implémenter TOTP avec pyotp

#### 12. **Pas de Détection d'Anomalies**
**Solution recommandée:** Détecter logins depuis nouveaux pays/devices

#### 13. **Pas de Password History**
**Solution recommandée:** Empêcher réutilisation des anciens passwords

#### 14. **Session Concurrency**
**Solution recommandée:** Limiter nombre de sessions actives simultanées

---

## 🛡️ Plan d'Action Recommandé

### Phase 1 - Critique (Cette semaine)
1. ✅ Implémenter Rate Limiting
2. ✅ Ajouter Token Blacklisting
3. ✅ Sécuriser les secrets (pas de commit .env)
4. ✅ Ajouter HTTPS en production
5. ✅ Corriger les timing attacks

### Phase 2 - Élevé (2 semaines)
1. ✅ Protection CSRF
2. ✅ Messages d'erreur génériques
3. ✅ Audit logging
4. ✅ Account lockout après X tentatives
5. ✅ Minimiser données dans JWT

### Phase 3 - Moyen (1 mois)
1. Email verification
2. Password policies renforcées
3. Monitoring et alertes
4. Tests de pénétration

### Phase 4 - Nice to have (2-3 mois)
1. 2FA/MFA
2. Détection d'anomalies
3. Password history
4. Session management avancé

---

## 🔒 Checklist de Sécurité Production

Avant de déployer en production:

```bash
# Environment
[ ] SECRET_KEY généré avec openssl rand -hex 32
[ ] ENCRYPTION_KEY sécurisé
[ ] .env dans .gitignore
[ ] Pas de secrets hardcodés

# Network
[ ] HTTPS activé (TLS 1.3)
[ ] CORS configuré correctement
[ ] Rate limiting activé
[ ] Firewall configuré

# Authentication
[ ] Token blacklisting implémenté
[ ] Audit logging activé
[ ] Account lockout configuré
[ ] Messages d'erreur génériques

# Database
[ ] Connexion chiffrée
[ ] Credentials sécurisés
[ ] Backups réguliers
[ ] Principe du moindre privilège

# Monitoring
[ ] Logs centralisés
[ ] Alertes configurées
[ ] Métriques de sécurité
[ ] Incident response plan

# Tests
[ ] Tests de sécurité passés
[ ] Scan de vulnérabilités
[ ] Penetration testing
[ ] Code review sécurité
```

---

## 📚 Ressources Supplémentaires

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [FastAPI Security Guide](https://fastapi.tiangolo.com/tutorial/security/)

---

**Date de l'audit:** 2025-01-12
**Prochaine revue:** À planifier après Phase 1
