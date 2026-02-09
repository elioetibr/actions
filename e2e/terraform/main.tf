terraform {
  required_version = ">= 1.0"

  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
    }
  }
}

resource "local_file" "greeting" {
  content  = var.greeting
  filename = "${path.module}/${var.filename}"
}

output "file_path" {
  description = "Path to the generated file"
  value       = local_file.greeting.filename
}

output "file_content" {
  description = "Content written to the file"
  value       = local_file.greeting.content
}
