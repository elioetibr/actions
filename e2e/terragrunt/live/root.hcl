# Root terragrunt.hcl — shared config for all modules
terraform {
  extra_arguments "no_color" {
    commands = get_terraform_commands_that_need_vars()

    arguments = [
      "-no-color",
    ]
  }
}
