variable "greeting" {
  description = "A greeting message to write to the output file"
  type        = string
}

variable "filename" {
  description = "Name of the output file"
  type        = string
  default     = "output.txt"
}
