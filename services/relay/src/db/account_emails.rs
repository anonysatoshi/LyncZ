//! Account Email Repository - CRUD operations for account email notifications
//! This is account-based (by wallet address), not role-based. Any wallet can be buyer or seller.

use super::models::DbAccountEmail;
use super::DbResult;
use sqlx::PgPool;
use std::time::{SystemTime, UNIX_EPOCH};

/// Repository for account email operations
pub struct AccountEmailRepository {
    pool: PgPool,
}

impl AccountEmailRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Get current unix timestamp
    fn now() -> i64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64
    }

    /// Get account email by wallet address
    pub async fn get(&self, wallet: &str) -> DbResult<Option<DbAccountEmail>> {
        let wallet_lower = wallet.to_lowercase();
        
        let result = sqlx::query_as::<_, DbAccountEmail>(
            r#"
            SELECT wallet, email, language, enabled, "createdAt", "updatedAt"
            FROM account_emails
            WHERE wallet = $1
            "#,
        )
        .bind(&wallet_lower)
        .fetch_optional(&self.pool)
        .await?;

        Ok(result)
    }

    /// Set or update account email (upsert)
    pub async fn upsert(&self, wallet: &str, email: &str, language: &str) -> DbResult<DbAccountEmail> {
        let wallet_lower = wallet.to_lowercase();
        let now = Self::now();
        
        let result = sqlx::query_as::<_, DbAccountEmail>(
            r#"
            INSERT INTO account_emails (wallet, email, language, enabled, "createdAt", "updatedAt")
            VALUES ($1, $2, $3, TRUE, $4, $4)
            ON CONFLICT (wallet) 
            DO UPDATE SET 
                email = EXCLUDED.email,
                language = EXCLUDED.language,
                "updatedAt" = EXCLUDED."updatedAt"
            RETURNING wallet, email, language, enabled, "createdAt", "updatedAt"
            "#,
        )
        .bind(&wallet_lower)
        .bind(email)
        .bind(language)
        .bind(now)
        .fetch_one(&self.pool)
        .await?;

        Ok(result)
    }

    /// Enable or disable notifications for an account
    pub async fn set_enabled(&self, wallet: &str, enabled: bool) -> DbResult<()> {
        let wallet_lower = wallet.to_lowercase();
        let now = Self::now();
        
        sqlx::query(
            r#"
            UPDATE account_emails 
            SET enabled = $2, "updatedAt" = $3
            WHERE wallet = $1
            "#,
        )
        .bind(&wallet_lower)
        .bind(enabled)
        .bind(now)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    /// Delete account email (opt out completely)
    pub async fn delete(&self, wallet: &str) -> DbResult<()> {
        let wallet_lower = wallet.to_lowercase();
        
        sqlx::query(
            r#"DELETE FROM account_emails WHERE wallet = $1"#,
        )
        .bind(&wallet_lower)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    /// Get email for an account if notifications are enabled
    pub async fn get_if_enabled(&self, wallet: &str) -> DbResult<Option<DbAccountEmail>> {
        let wallet_lower = wallet.to_lowercase();
        
        let result = sqlx::query_as::<_, DbAccountEmail>(
            r#"
            SELECT wallet, email, language, enabled, "createdAt", "updatedAt"
            FROM account_emails
            WHERE wallet = $1 AND enabled = TRUE
            "#,
        )
        .bind(&wallet_lower)
        .fetch_optional(&self.pool)
        .await?;

        Ok(result)
    }
}

