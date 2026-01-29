//! Account API handlers
//! 
//! Endpoints for account settings, including email notifications.
//! Account-based (by wallet address), not role-based. Any wallet can be buyer or seller.

use axum::{
    extract::{Query, State},
    Json,
};
use serde::{Deserialize, Serialize};

use crate::api::{
    error::{ApiError, ApiResult},
    state::AppState,
};

/// Request to set account email
#[derive(Debug, Deserialize)]
pub struct SetAccountEmailRequest {
    pub wallet: String,        // Wallet address
    pub email: String,         // Email address
    pub language: Option<String>, // Language preference: 'en', 'zh-CN', 'zh-TW'
}

/// Response for account email operations
#[derive(Debug, Serialize)]
pub struct AccountEmailResponse {
    pub wallet: String,
    pub email: String,
    pub language: String,
    pub enabled: bool,
}

/// Query params for GET/DELETE
#[derive(Debug, Deserialize)]
pub struct AccountQuery {
    pub address: String,
}

/// POST /api/account/email - Set or update account email
pub async fn set_account_email(
    State(state): State<AppState>,
    Json(request): Json<SetAccountEmailRequest>,
) -> ApiResult<Json<AccountEmailResponse>> {
    // Validate email format (basic check)
    if !request.email.contains('@') || !request.email.contains('.') {
        return Err(ApiError::BadRequest("Invalid email format".to_string()));
    }
    
    // Validate language
    let language = request.language.unwrap_or_else(|| "en".to_string());
    if !["en", "zh-CN", "zh-TW"].contains(&language.as_str()) {
        return Err(ApiError::BadRequest("Invalid language. Use 'en', 'zh-CN', or 'zh-TW'".to_string()));
    }
    
    // Validate address format
    if !request.wallet.starts_with("0x") || request.wallet.len() != 42 {
        return Err(ApiError::BadRequest("Invalid wallet address".to_string()));
    }
    
    let result = state.db.upsert_account_email(&request.wallet, &request.email, &language).await?;
    
    Ok(Json(AccountEmailResponse {
        wallet: result.wallet,
        email: result.email,
        language: result.language,
        enabled: result.enabled,
    }))
}

/// GET /api/account/email?address=0x... - Get account email settings
pub async fn get_account_email(
    State(state): State<AppState>,
    Query(query): Query<AccountQuery>,
) -> ApiResult<Json<Option<AccountEmailResponse>>> {
    let result = state.db.get_account_email(&query.address).await?;
    
    Ok(Json(result.map(|r| AccountEmailResponse {
        wallet: r.wallet,
        email: r.email,
        language: r.language,
        enabled: r.enabled,
    })))
}

/// DELETE /api/account/email?address=0x... - Delete account email (opt out)
pub async fn delete_account_email(
    State(state): State<AppState>,
    Query(query): Query<AccountQuery>,
) -> ApiResult<Json<serde_json::Value>> {
    state.db.delete_account_email(&query.address).await?;
    
    Ok(Json(serde_json::json!({
        "message": "Email notifications disabled",
        "wallet": query.address
    })))
}

/// Request to toggle email notifications
#[derive(Debug, Deserialize)]
pub struct ToggleAccountEmailRequest {
    pub wallet: String,
    pub enabled: bool,
}

/// POST /api/account/email/toggle - Enable/disable notifications
pub async fn toggle_account_email(
    State(state): State<AppState>,
    Json(request): Json<ToggleAccountEmailRequest>,
) -> ApiResult<Json<serde_json::Value>> {
    state.db.set_account_email_enabled(&request.wallet, request.enabled).await?;
    
    Ok(Json(serde_json::json!({
        "message": if request.enabled { "Notifications enabled" } else { "Notifications disabled" },
        "wallet": request.wallet,
        "enabled": request.enabled
    })))
}

