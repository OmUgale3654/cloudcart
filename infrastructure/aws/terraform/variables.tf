variable "aws_region" {
  description = "The AWS region to deploy resources into"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (e.g. dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "vpc_cidr" {
  description = "CIDR block for the CloudCart VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_username" {
  description = "Master username for CloudCart PostgreSQL RDS instance"
  type        = string
  default     = "cloudcart_admin"
  sensitive   = true
}

variable "db_password" {
  description = "Master password for CloudCart PostgreSQL RDS instance"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "Secret key used for HMAC-SHA256 JWT signature verification"
  type        = string
  sensitive   = true
}

variable "enable_nat_gateway" {
  description = "Set to true for high security private subnets, or false for cost-saving single-tier architecture"
  type        = bool
  default     = false
}
