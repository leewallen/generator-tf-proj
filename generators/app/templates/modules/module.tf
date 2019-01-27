resource "null_resource" "<%= component %>" {
    provisioner "local-exec" {
        command = "echo You are deploying to the ${var.environment} environment!"
    }
}
