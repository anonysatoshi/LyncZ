use sqlx::PgPool;

use super::DbResult;
use super::models::DbWithdrawal;

/// Repository for Withdrawal operations - tracks withdrawal history for order activity timeline
pub struct PostgresWithdrawalRepository {
    pool: PgPool,
}

impl PostgresWithdrawalRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
    
    /// Insert new withdrawal record
    pub async fn create(&self, order_id: &str, amount: &str, remaining_after: &str, tx_hash: Option<&str>) -> DbResult<()> {
        sqlx::query(
            r#"
            INSERT INTO withdrawals ("orderId", "amount", "remainingAfter", "txHash")
            VALUES ($1, $2::numeric, $3::numeric, $4)
            "#,
        )
        .bind(order_id)
        .bind(amount)
        .bind(remaining_after)
        .bind(tx_hash)
        .execute(&self.pool)
        .await?;
        
        Ok(())
    }
    
    /// Get all withdrawals for an order, sorted by creation time descending
    pub async fn get_by_order(&self, order_id: &str) -> DbResult<Vec<DbWithdrawal>> {
        let rows = sqlx::query(
            r#"
            SELECT 
                id,
                "orderId",
                "amount"::TEXT,
                "remainingAfter"::TEXT,
                "txHash",
                "createdAt"
            FROM withdrawals
            WHERE "orderId" = $1
            ORDER BY "createdAt" DESC
            "#,
        )
        .bind(order_id)
        .fetch_all(&self.pool)
        .await?;
        
        let withdrawals: Vec<DbWithdrawal> = rows
            .into_iter()
            .map(|row| {
                use sqlx::Row;
                DbWithdrawal {
                    id: row.get("id"),
                    order_id: row.get("orderId"),
                    amount: row.get::<Option<String>, _>("amount").unwrap_or_default(),
                    remaining_after: row.get::<Option<String>, _>("remainingAfter").unwrap_or_default(),
                    tx_hash: row.get("txHash"),
                    created_at: row.get("createdAt"),
                }
            })
            .collect();
        
        Ok(withdrawals)
    }
}
