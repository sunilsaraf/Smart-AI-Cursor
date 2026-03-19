terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  default     = "production"
}

# VPC and networking would go here

# RDS PostgreSQL instance
resource "aws_db_instance" "codepilot" {
  identifier           = "codepilot-db"
  engine               = "postgres"
  engine_version       = "16.1"
  instance_class       = "db.t3.medium"
  allocated_storage    = 100
  storage_encrypted    = true
  publicly_accessible  = false
  skip_final_snapshot  = false
  final_snapshot_identifier = "codepilot-db-final-snapshot"
  
  tags = {
    Name        = "codepilot-db"
    Environment = var.environment
  }
}

# ElastiCache Redis cluster
resource "aws_elasticache_cluster" "codepilot" {
  cluster_id           = "codepilot-redis"
  engine               = "redis"
  node_type            = "cache.t3.medium"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  engine_version       = "7.0"
  port                 = 6379
  
  tags = {
    Name        = "codepilot-redis"
    Environment = var.environment
  }
}

# S3 bucket for object storage
resource "aws_s3_bucket" "codepilot" {
  bucket = "codepilot-storage-${var.environment}"
  
  tags = {
    Name        = "codepilot-storage"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "codepilot" {
  bucket = aws_s3_bucket.codepilot.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

output "database_endpoint" {
  value = aws_db_instance.codepilot.endpoint
}

output "redis_endpoint" {
  value = aws_elasticache_cluster.codepilot.cache_nodes[0].address
}

output "s3_bucket_name" {
  value = aws_s3_bucket.codepilot.id
}
