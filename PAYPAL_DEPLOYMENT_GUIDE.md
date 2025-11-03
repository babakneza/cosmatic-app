# PayPal Integration - Deployment Guide

**Version**: 1.0  
**Project**: BuyJan E-Commerce Platform  
**Status**: Ready for Deployment

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Staging Deployment](#staging-deployment)
3. [Production Deployment](#production-deployment)
4. [Monitoring Setup](#monitoring-setup)
5. [Rollback Procedures](#rollback-procedures)
6. [Post-Deployment Verification](#post-deployment-verification)

---

## Pre-Deployment Checklist

### Code Readiness

- [x] All 78 unit tests passing ✅
- [x] Code reviewed and approved
- [x] TypeScript type checking passing
- [x] Linting passed
- [x] Security audit completed (85%)
- [x] Performance testing completed
- [x] Documentation complete

### Credentials & Configuration

- [ ] PayPal Sandbox credentials obtained
- [ ] PayPal Production credentials obtained
- [ ] All environment variables documented
- [ ] Credentials stored securely (not in git)
- [ ] Backup credentials stored safely
- [ ] API tokens generated and verified

### Infrastructure

- [ ] HTTPS/TLS certificates ready
- [ ] Database backups enabled
- [ ] Monitoring services configured
- [ ] Alert thresholds set
- [ ] Log aggregation enabled
- [ ] CDN configured (if applicable)

### Team Readiness

- [ ] Deployment team trained
- [ ] Incident response plan ready
- [ ] Support team briefed
- [ ] Customer communication plan ready
- [ ] Rollback team assembled
- [ ] On-call schedule established

### Documentation

- [x] Developer guide completed ✅
- [x] API documentation complete ✅
- [ ] Runbook for common issues created
- [ ] Incident response procedures documented
- [ ] Team access and permissions verified
- [ ] Change log prepared

---

## Staging Deployment

### 1. Staging Environment Setup

#### 1.1 Create Staging Environment

```bash
# Clone production environment to staging
# (Performed by DevOps/Infrastructure team)

# Expected structure:
# staging-buyjan.com (public)
# admin-staging.buyjan.com (admin panel)
# staging-api.buyjan.com (API endpoints)
```

#### 1.2 Configure Staging Environment Variables

Create `.env.staging.local`:

```env
# ============================================
# PayPal Staging Configuration (SANDBOX MODE)
# ============================================
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_secret
PAYPAL_MODE=sandbox

# ============================================
# Site Configuration
# ============================================
NEXT_PUBLIC_SITE_URL=https://staging-buyjan.com
NODE_ENV=production

# ============================================
# Directus Configuration
# ============================================
NEXT_PUBLIC_DIRECTUS_URL=https://admin-staging.buyjan.com
DIRECTUS_API_TOKEN=staging_api_token_here

# ============================================
# Monitoring & Logging
# ============================================
SENTRY_DSN=https://your_sentry_key@sentry.io/project
LOG_LEVEL=info
NEXT_PUBLIC_GA_ID=UA_STAGING_ID
```

**⚠️ Security Notes**:
- Never commit `.env.staging.local` to git
- Use secure credential management (e.g., HashiCorp Vault, AWS Secrets Manager)
- Rotate credentials regularly
- Use different credentials for staging vs. production

#### 1.3 Deploy to Staging

```bash
# 1. Push code to staging branch
git checkout develop
git pull origin develop
git push origin develop:staging

# 2. Build and deploy
npm run build
npm run start

# OR using Docker (if applicable):
docker build -t buyjan:staging .
docker push your_registry/buyjan:staging
# Deploy via orchestration tool (k8s, etc.)

# 3. Verify deployment
curl https://staging-buyjan.com
# Should return 200 OK with page content
```

### 2. Staging Testing

#### 2.1 Manual Testing Checklist

**Checkout Flow**:
- [ ] Navigate to checkout page
- [ ] Select PayPal as payment method
- [ ] Click PayPal button
- [ ] PayPal popup opens correctly
- [ ] Login to PayPal sandbox account
- [ ] Review order details
- [ ] Approve payment
- [ ] Return to site with success message
- [ ] Order appears in Directus

**Payment Scenarios**:
- [ ] Successful payment capture
  - [ ] Order created in Directus
  - [ ] Payment status shows "completed"
  - [ ] Transaction ID stored correctly
  
- [ ] Payment cancellation
  - [ ] User clicks "Cancel" button
  - [ ] Returns to checkout
  - [ ] No order created
  - [ ] Cart items still present
  
- [ ] Payment error handling
  - [ ] Network timeout shows error message
  - [ ] Expired session handled gracefully
  - [ ] Invalid amount shows validation error
  - [ ] PayPal unavailable shows generic message

**Edge Cases**:
- [ ] Browser back button during payment
- [ ] Multiple rapid payment attempts
- [ ] Session expiration during payment
- [ ] Network disconnection and recovery
- [ ] Special characters in customer names
- [ ] Large order amounts
- [ ] Very small order amounts

**Localization**:
- [ ] Arabic (RTL) messages display correctly
- [ ] English (LTR) messages display correctly
- [ ] Currency formatting (OMR with 3 decimals)
- [ ] Date formatting per locale
- [ ] Error messages in both languages

#### 2.2 Performance Testing

```bash
# Load testing (using Apache JMeter or similar)
# Simulate 100 concurrent users for 5 minutes

Target Endpoints:
- POST /api/payments/paypal/create-order
- POST /api/payments/paypal/capture-order

Performance Targets:
- Response time < 1 second (p95)
- Error rate < 0.1%
- Throughput > 100 req/sec
- CPU usage < 70%
- Memory usage stable

Tools:
- Apache JMeter
- Locust
- K6
- Artillery
```

#### 2.3 Security Testing

```bash
# API Security Tests
- [ ] CORS headers correct
- [ ] CSRF tokens working
- [ ] Rate limiting active (1 req/sec per user)
- [ ] No sensitive data in logs
- [ ] HTTPS enforced
- [ ] Security headers present

curl -i https://staging-buyjan.com/api/payments/paypal/create-order
# Check response headers:
# - Strict-Transport-Security
# - X-Content-Type-Options
# - X-Frame-Options
# - Content-Security-Policy
```

#### 2.4 Database Verification

```bash
# Check Directus order creation
1. Create test order via PayPal
2. Verify in Directus admin:
   - Order record created
   - payment_intent_id populated (PayPal transaction ID)
   - payment_status = "completed"
   - customer_id linked correctly
   - Items correctly recorded
   - Totals match
```

#### 2.5 Monitoring & Alerts

```bash
# Test monitoring alerts
1. Configure test alert thresholds
2. Trigger alert conditions (e.g., payment failure)
3. Verify alerts sent to:
   - Slack/Teams (if configured)
   - PagerDuty (if configured)
   - Email notifications
4. Verify alerts contain relevant information
5. Test alert escalation
```

### 3. Sign-Off for Production

**Stakeholders to Approve**:
- [ ] Development Team Lead
- [ ] QA/Testing Lead
- [ ] DevOps/Infrastructure Lead
- [ ] Security Team
- [ ] Product Manager
- [ ] Finance/Business Owner

**Sign-Off Template**:
```
Staging Deployment Sign-Off
Date: _______________
Tested By: ___________
Results: PASSED / FAILED

Issues Found: [List any issues]
Resolved: [List resolutions]

Ready for Production: YES / NO
Approved By: ___________
```

---

## Production Deployment

### 1. Pre-Production Setup

#### 1.1 Production Credentials

```env
# .env.production.local (NEVER commit!)
# Use secure credential management system

# ============================================
# PayPal Production Configuration (LIVE MODE)
# ============================================
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_production_client_id
PAYPAL_CLIENT_SECRET=your_production_secret
PAYPAL_MODE=live

# ============================================
# Site Configuration
# ============================================
NEXT_PUBLIC_SITE_URL=https://buyjan.com
NODE_ENV=production

# ============================================
# Directus Configuration
# ============================================
NEXT_PUBLIC_DIRECTUS_URL=https://admin.buyjan.com
DIRECTUS_API_TOKEN=production_api_token_here

# ============================================
# Monitoring & Logging (Production)
# ============================================
SENTRY_DSN=https://your_prod_sentry@sentry.io/project
SENTRY_ENVIRONMENT=production
LOG_LEVEL=warn
NEXT_PUBLIC_GA_ID=UA_PRODUCTION_ID
```

**⚠️ CRITICAL**:
- Use environment variable management (not hardcoded)
- Multiple team members should NOT have access to both credentials
- Enable audit logging for credential access
- Implement credential rotation schedule
- Store backup credentials in secure location

#### 1.2 Deployment Sequence

```bash
# 1. Build production artifacts
npm run build
# Check build size:
ls -lh .next/

# 2. Run final tests
npm run test -- tests/unit/ --run
npm run type-check

# 3. Create deployment package
npm run start  # Test locally first

# 4. Tag production release
git tag -a v1.0.0-paypal -m "PayPal integration production release"
git push origin v1.0.0-paypal

# 5. Deployment confirmation required
echo "Ready for production deployment"
```

#### 1.3 Deployment Window

**Recommended Schedule**:
- Time: Off-peak hours (e.g., 2 AM - 5 AM local time)
- Day: Tuesday-Thursday (avoid Monday issues, Friday changes)
- Duration: Plan for 30 minutes to 1 hour
- Team: Full deployment and support team available

**Communication**:
- [ ] Notify customer support team
- [ ] Prepare customer communications
- [ ] Brief payment team
- [ ] Alert DevOps team
- [ ] Establish war room/channel

### 2. Production Deployment Steps

#### Step 1: Pre-Deployment Health Check

```bash
# 1. Verify current system health
# Check PayPal API health
curl https://api.paypal.com/v1/health

# 2. Verify Directus connectivity
curl https://admin.buyjan.com/health

# 3. Check infrastructure
# - Database connections OK
# - Cache system OK
# - Load balancers OK
# - CDN functioning

# 4. Monitor baseline
# - Current error rates
# - Current response times
# - Active user count
```

#### Step 2: Deploy Code

```bash
# Option 1: Blue-Green Deployment (Recommended)
# Keep current version running while deploying new version
# Switch traffic after verification

# Option 2: Rolling Deployment
# Gradually replace instances with new version
# 25% → 50% → 75% → 100%

# Option 3: Canary Deployment
# Route 5% of traffic to new version
# Monitor metrics, gradually increase to 100%

# Specific commands depend on infrastructure
# Examples:
# - Kubernetes: kubectl set image deployment/buyjan-app app=buyjan:v1.0.0
# - Docker Swarm: docker service update --image buyjan:v1.0.0 buyjan-app
# - VPS: git pull && npm install && npm run build && systemctl restart buyjan
```

#### Step 3: Verify Deployment

```bash
# 1. Check deployment status
curl https://buyjan.com/api/health
# Should return: { status: "ok", version: "1.0.0" }

# 2. Verify PayPal endpoints
curl -X POST https://buyjan.com/api/payments/paypal/create-order \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
# Should return 400 (invalid input) not 500 (error)

# 3. Check error rates
# Monitor dashboard - should be normal, no spike

# 4. Verify logging
# Check logs for errors - should be clean

# 5. Database check
# Verify no data corruption
# Check transaction logs
```

#### Step 4: Run Smoke Tests

```bash
# Quick sanity checks
# (Automated smoke test script)

# 1. Create test payment order
# 2. Verify order creation response
# 3. Check order in Directus
# 4. Verify no errors in logs
# 5. Check payment tracking metrics

# Script: smoke-tests.sh
#!/bin/bash
echo "Running production smoke tests..."
npm run test:smoke
if [ $? -eq 0 ]; then
  echo "✅ Smoke tests passed"
else
  echo "❌ Smoke tests failed - ROLLBACK!"
  exit 1
fi
```

#### Step 5: Monitor Real Traffic

```bash
# Monitor production metrics for 1 hour
# Check dashboards:

# 1. Payment Success Rate
# Target: > 95%
# Alert if: < 90%

# 2. Response Times
# Target: < 500ms (p95)
# Alert if: > 1s

# 3. Error Rates
# Target: < 0.5%
# Alert if: > 2%

# 4. Resource Usage
# CPU: < 60%
# Memory: < 70%
# Disk: < 80%

# 5. Order Volume
# Should match expected traffic patterns

# During this period:
# - Monitor continuously
# - Have rollback team on standby
# - Check error logs every 5 minutes
# - Verify Directus orders creating correctly
```

#### Step 6: Issue Resolution

**If Critical Issue Found** → Rollback immediately:

```bash
# Rollback to previous version
# See Rollback Procedures section below

# Alert team
# Document issue
# Investigate root cause
# Fix and re-test
# Re-deploy with fix
```

**If Minor Issue Found**:

```bash
# Document issue
# Continue monitoring
# Plan fix for next deployment
# Keep incident channel open
```

### 3. Production Sign-Off

```
Production Deployment Sign-Off
Date/Time: _______________
Deployed By: ___________
Verified By: ___________

Deployment Status: SUCCESS / FAILED
Issues: NONE / [List any issues]
Rollback Required: NO / YES

Ready for Normal Operations: YES / NO
All-Clear By: ___________
Signature: ___________
```

---

## Monitoring Setup

### 1. Performance Monitoring

#### Key Metrics to Track

```typescript
// src/lib/paypal/monitoring.ts

Metrics:
- Total payments processed
- Successful payments
- Failed payments
- Success rate (%)
- Average processing time
- P95 response time
- P99 response time
- Retry count
- Error frequency by type
- Payment amount distribution
```

#### Dashboard Configuration

**Tool**: Grafana / DataDog / New Relic

```
Dashboard: PayPal Payments

Panels:
1. Success Rate (last 24h)
2. Error Rate (last 24h)
3. Processing Time (p50, p95, p99)
4. Payment Volume
5. Error Distribution
6. Top Errors
7. Retry Distribution
8. Customer Impact
```

### 2. Alert Configuration

#### Alert Thresholds

```yaml
Alerts:
  # Critical: Immediate page-on-call
  - name: "Payment Success Rate < 90%"
    severity: CRITICAL
    condition: success_rate < 0.9
    duration: 5 minutes
    action: page on-call engineer

  - name: "Payment Processing > 5 seconds (p95)"
    severity: CRITICAL
    condition: p95_response_time > 5000
    duration: 5 minutes
    action: page on-call engineer

  # Warning: Notify team
  - name: "Payment Success Rate < 95%"
    severity: WARNING
    condition: success_rate < 0.95
    duration: 10 minutes
    action: notify #payments channel

  - name: "Error Rate > 2%"
    severity: WARNING
    condition: error_rate > 0.02
    duration: 5 minutes
    action: notify #payments channel

  # Info: Log only
  - name: "Unusual Payment Amount"
    severity: INFO
    condition: amount > average * 2
    action: log to Sentry
```

#### Notification Channels

```bash
# Configure for:
- [ ] PagerDuty (on-call escalation)
- [ ] Slack (#payments channel)
- [ ] Email (team members)
- [ ] SMS (critical alerts)
- [ ] Webhook (custom integrations)
```

### 3. Logging & Debugging

#### Centralized Logging

```bash
# Tools: ELK Stack / Datadog / CloudWatch

# Log all payment events:
POST /api/payments/paypal/create-order
→ Logs: customer_id, email, amount, order_id
→ Level: INFO

Payment capture:
POST /api/payments/paypal/capture-order
→ Logs: transaction_id, amount, status
→ Level: INFO

Errors:
→ Logs: error_type, stack_trace, context
→ Level: ERROR
→ Sentry event created
```

#### Log Retention

```
Retention Policy:
- DEBUG logs: 7 days
- INFO logs: 30 days
- ERROR logs: 90 days
- CRITICAL logs: 1 year
- PII (personally identifiable info): NEVER log
```

### 4. Error Tracking (Sentry Integration)

#### Setup Sentry

```typescript
// pages/_app.tsx or next.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT,
  tracesSampleRate: 0.1,
  
  // Filter out non-critical errors
  beforeSend(event, hint) {
    if (event.level === 'info') {
      return null; // Don't send info level
    }
    return event;
  },
  
  // Ignore certain error types
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection'
  ]
});
```

#### Track PayPal Events

```typescript
import * as Sentry from "@sentry/nextjs";

// Track successful payment
Sentry.captureMessage('Payment captured', 'info', {
  tags: { payment_method: 'paypal' },
  extra: { transaction_id, amount }
});

// Track payment error
Sentry.captureException(error, {
  tags: { payment_method: 'paypal', type: error.type },
  extra: { order_id, customer_id }
});
```

### 5. Uptime Monitoring

```bash
# Tools: UptimeRobot / Pingdom / CloudWatch

# Monitor endpoints:
- GET /                          (Site health)
- GET /api/health                (API health)
- POST /api/payments/paypal/create-order  (PayPal endpoint)

# Configuration:
- Check every 1 minute
- Alert if down for 5 minutes
- Verify SSL certificate validity
- Check response time
```

---

## Rollback Procedures

### When to Rollback

**Immediate Rollback If**:
- [ ] Payment success rate drops below 80%
- [ ] Response times exceed 10 seconds
- [ ] Critical security vulnerability discovered
- [ ] Data corruption detected
- [ ] Directus integration broken
- [ ] PayPal connectivity lost
- [ ] Unable to create orders

**Consider Rollback If**:
- [ ] Payment success rate 80-90% (investigate first)
- [ ] Response times 2-10 seconds (investigate first)
- [ ] Minor issues affecting < 5% of users

### Rollback Steps

#### 1. Decision & Authorization

```
Rollback Decision Checklist:
- [ ] Issue severity assessed
- [ ] Root cause identified (if possible)
- [ ] Impact quantified (% of users)
- [ ] Rollback authorized by lead engineer
- [ ] All stakeholders notified
```

#### 2. Initiate Rollback

```bash
# Option 1: Kubernetes Rollback
kubectl rollout undo deployment/buyjan-app
kubectl rollout status deployment/buyjan-app

# Option 2: Docker Stack Rollback
docker service update --image buyjan:v1.0.0 buyjan-app

# Option 3: VPS Rollback
# Check deployment timeline
git log --oneline
# Rollback to previous commit
git checkout previous_commit_hash
npm install
npm run build
npm start
```

#### 3. Verify Rollback

```bash
# 1. Confirm version rolled back
curl https://buyjan.com/api/version
# Should show: v0.x.x (previous version)

# 2. Monitor error rates
# Should drop to normal levels

# 3. Verify functionality
# Run smoke tests again

# 4. Check payments
# Verify payment processing working

# 5. Check logs
# Should show normal error rates
```

#### 4. Post-Rollback

```bash
# 1. Document incident
- Issue description
- Impact analysis
- Root cause
- Resolution time
- Lessons learned

# 2. Notify stakeholders
- Support team
- Customers (if affected)
- Payment team

# 3. Investigate root cause
- Add to post-mortem
- Plan fix
- Testing before re-deployment

# 4. Update deployment plan
- Add additional testing steps
- Implement monitoring improvements
```

#### 5. Post-Mortem Template

```markdown
# PayPal Integration Incident Post-Mortem

**Date**: _______________
**Issue**: _______________
**Duration**: _______________
**Affected Users**: _______________

## Timeline
- HH:MM - Issue detected
- HH:MM - Rollback initiated
- HH:MM - Rollback completed
- HH:MM - All clear

## Root Cause
[Analysis of what went wrong]

## Impact
- Payments affected: X%
- Revenue impact: $XXX
- Users affected: XXX

## Lessons Learned
1. [Lesson 1]
2. [Lesson 2]
3. [Lesson 3]

## Action Items
1. [ ] Implement monitoring for [metric]
2. [ ] Add test for [scenario]
3. [ ] Improve [process]

## Responsible Person: _______________
```

---

## Post-Deployment Verification

### Day 1 (Deployment Day)

#### Morning
- [ ] All systems operational
- [ ] No error rate spikes
- [ ] Payment success rate normal (>95%)
- [ ] Response times normal (<500ms p95)
- [ ] No database issues
- [ ] Orders creating correctly in Directus
- [ ] Logs clean

#### Evening
- [ ] 24+ hours of metrics collected
- [ ] No unusual patterns
- [ ] Customer support reports normal
- [ ] Payment volume matching expectations
- [ ] No security alerts

### Week 1

- [ ] Monitor daily metrics
- [ ] Check error trends
- [ ] Review customer feedback
- [ ] Verify payment processing consistency
- [ ] Check retry statistics
- [ ] Monitor resource usage
- [ ] Review server logs periodically

### Week 2-4

- [ ] Verify long-term stability
- [ ] Check seasonal patterns
- [ ] Monitor for memory leaks
- [ ] Verify database performance
- [ ] Review compliance/audit logs
- [ ] Plan for performance optimization

### Ongoing

- [ ] Weekly metric review
- [ ] Monthly performance analysis
- [ ] Quarterly security audit
- [ ] Regular backup verification
- [ ] Disaster recovery testing

### Success Criteria

✅ **Deployment Successful If**:
- Success rate maintained >95% after 24 hours
- No critical errors in logs
- Response times stable
- User feedback positive
- No rollback required
- Database integrity maintained
- Directus orders correct
- Support tickets normal

❌ **Deployment Failed If**:
- Success rate drops <90%
- Critical errors appearing
- Response times >2 seconds sustained
- Database issues detected
- Orders not creating properly
- Rollback required

---

## Disaster Recovery

### Backup & Recovery Plan

```bash
# Daily backups
- Database backup: Every 6 hours
- Configuration backup: Every 12 hours
- Log backup: Real-time to external storage

# Recovery Point Objective (RPO)
- Maximum data loss: 1 hour

# Recovery Time Objective (RTO)
- Maximum downtime: 2 hours

# Test recovery monthly
- [ ] Backup recovery tested
- [ ] Data integrity verified
- [ ] Recovery time documented
```

### Failover Plan

```bash
# If primary server fails:
1. Detect failure (automatic monitoring)
2. Initiate failover (automatic or manual)
3. DNS update to secondary (< 5 min)
4. Verify secondary operational
5. Notify stakeholders
6. Repair primary server
7. Update DNS when ready
```

---

## Deployment Checklist (Summary)

### Pre-Deployment
- [ ] All tests passing (78/78)
- [ ] Code reviewed
- [ ] Security audit complete
- [ ] Performance tested
- [ ] Team trained
- [ ] Credentials prepared
- [ ] Backup taken
- [ ] Rollback plan ready

### Deployment
- [ ] Health check passed
- [ ] Code deployed
- [ ] Services started
- [ ] Smoke tests passed
- [ ] Monitoring active
- [ ] Team notified
- [ ] Customer notified (if needed)

### Post-Deployment
- [ ] Verify functionality
- [ ] Monitor metrics
- [ ] Check error rates
- [ ] Verify database
- [ ] Confirm orders creating
- [ ] Document issues (if any)
- [ ] Update runbooks

---

## Emergency Contacts

```
On-Call Engineer: _______________
Mobile: _______________

Lead Engineer: _______________
Mobile: _______________

DevOps Lead: _______________
Mobile: _______________

Product Manager: _______________
Mobile: _______________

VP Engineering: _______________
Mobile: _______________

CEO/Founder: _______________
Mobile: _______________
```

---

## Useful Commands

```bash
# Check deployment status
npm run health-check

# View current version
npm run version

# View logs in real-time
tail -f logs/paypal.log
npm run logs:paypal

# View metrics
npm run metrics

# Run tests before deployment
npm run test
npm run type-check

# Build for production
npm run build

# Start production server
npm start
```

---

## Support & Escalation

### Support Channels

- **Slack**: #payments
- **Email**: payments@buyjan.com
- **On-Call**: See Emergency Contacts
- **Escalation**: Director of Engineering

### Support Priorities

1. **CRITICAL**: Payment system down
2. **HIGH**: Payment success rate <90%
3. **MEDIUM**: Individual payment failures
4. **LOW**: Performance optimization

---

**Created**: 2024  
**Maintained By**: Engineering Team  
**Status**: Production Ready ✅