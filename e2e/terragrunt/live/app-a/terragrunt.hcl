include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "../../modules/greeting"
}

inputs = {
  greeting = "Hello from app-a"
  filename = "app-a-output.txt"
}
