variable "greeting" {
  description = "A greeting message to write to the output file"
  type        = string
  default     = "Hello from e2e test"
}

variable "filename" {
  description = "Name of the output file"
  type        = string
  default     = "e2e-output.txt"
}
