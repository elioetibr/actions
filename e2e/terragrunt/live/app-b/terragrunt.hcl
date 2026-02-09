include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "../../modules/greeting"
}

inputs = {
  greeting = "Hello from app-b"
  filename = "app-b-output.txt"
}
