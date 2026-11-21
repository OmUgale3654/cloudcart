output "alb_dns_name" {
  description = "Public URL for accessing the CloudCart Platform (Frontend & Gateway)"
  value       = aws_lb.main.dns_name
}

output "rds_endpoint" {
  description = "PostgreSQL RDS connection endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "ecr_repositories" {
  description = "Map of ECR repository URLs created for all microservices"
  value       = { for k, v in aws_ecr_repository.services : k => v.repository_url }
}

output "ecs_cluster_name" {
  description = "ECS cluster identifier"
  value       = aws_ecs_cluster.main.name
}
