provider "aws" {
  region = "us-east-1" # Specify your AWS region
}



resource "aws_budgets_budget" "daily" {
  name              = "DailyBudget"
  budget_type       = "COST"
  time_unit         = "DAILY"
  limit_amount      = "0.01"
  limit_unit        = "USD"
  time_period_start = "2024-11-01_00:00" # Adjust the start date as needed

}

# resource "aws_s3_bucket" "sagemaker_bucket" {
#   bucket = "terraform-s3-testing-bucket-weiho"

#   tags = {
#     Name        = "terraform-s3-bucket"
#     Environment = "Production"
#   }
# }


# resource "aws_iam_role" "sagemaker_execution_role" {
#   name = "sagemaker_execution_role"

#   assume_role_policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Effect = "Allow"
#         Principal = {
#           Service = "sagemaker.amazonaws.com"
#         }
#         Action = "sts:AssumeRole"
#       }
#     ]
#   })
# }

# resource "aws_iam_policy" "sagemaker_policy" {
#   name = "sagemaker_policy"

#   policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Effect = "Allow"
#         Action = [
#           "s3:GetObject",
#           "s3:PutObject",
#           "s3:ListBucket"
#         ]
#         Resource = [
#           aws_s3_bucket.sagemaker_bucket.arn,
#           "${aws_s3_bucket.sagemaker_bucket.arn}/*"
#         ]
#       },
#       {
#         Effect = "Allow"
#         Action = [
#           "cloudwatch:PutMetricData",
#           "logs:CreateLogStream",
#           "logs:PutLogEvents"
#         ]
#         Resource = "*"
#       },
#       {
#         Effect = "Allow"
#         Action = [
#           "ecr:GetAuthorizationToken",
#           "ecr:BatchGetImage",
#           "ecr:BatchCheckLayerAvailability",
#           "ecr:GetDownloadUrlForLayer"
#         ]
#         Resource = "*"
#       },
#       {
#         Effect = "Allow"
#         Action = [
#           "sts:AssumeRole"
#         ]
#         Resource = "*"
#       }
#     ]
#   })
# }


# resource "aws_iam_role_policy_attachment" "sagemaker_policy_attachment" {
#   role       = aws_iam_role.sagemaker_execution_role.name
#   policy_arn = aws_iam_policy.sagemaker_policy.arn
# }

# resource "aws_ecr_repository" "private_repo" {
#   name = "sagemaker-model-repo"
# }
# resource "aws_ecr_repository_policy" "private_repo_policy" {
#   repository = aws_ecr_repository.private_repo.name

#   policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Effect = "Allow"
#         Principal = {
#           AWS = aws_iam_role.sagemaker_execution_role.arn
#         }
#         Action = [
#           "ecr:GetDownloadUrlForLayer",
#           "ecr:BatchGetImage",
#           "ecr:BatchCheckLayerAvailability"
#         ]
#       }
#     ]
#   })
# }


# resource "aws_sagemaker_model" "sagemaker_model" {
#   name              = "sagemaker-model"
#   execution_role_arn = aws_iam_role.sagemaker_execution_role.arn

#   primary_container {
#     image = "${aws_ecr_repository.private_repo.repository_url}:latest"
#   }
# }
# resource "aws_security_group" "allow_all" {
#   name        = "allow_all_traffic"
#   description = "Security group to allow all inbound and outbound traffic"

#   ingress {
#     from_port        = 0
#     to_port          = 0
#     protocol         = "-1"          # -1 means all protocols
#     cidr_blocks      = ["0.0.0.0/0"] # Allows all IPv4 addresses
#     ipv6_cidr_blocks = ["::/0"]      # Allows all IPv6 addresses
#   }

#   egress {
#     from_port        = 0
#     to_port          = 0
#     protocol         = "-1"          # -1 means all protocols
#     cidr_blocks      = ["0.0.0.0/0"] # Allows all IPv4 addresses
#     ipv6_cidr_blocks = ["::/0"]      # Allows all IPv6 addresses
#   }

#   tags = {
#     Name = "allow_all_traffic"
#   }
# }

# resource "aws_instance" "my_ec2_instance" {
#   ami             = "ami-012967cc5a8c9f891"
#   instance_type   = "t2.micro"
#   security_groups = [aws_security_group.allow_all.name] # Attach the security group

#   tags = {
#     Name = "MyEC2Instance"
#   }
# }
