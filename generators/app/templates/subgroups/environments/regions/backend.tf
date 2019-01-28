<% if (backend == "s3") { %>
provider "<%= provider %>" {
  # provider parameters here. Override any secrets at run time and avoid storing them in source control
  version = "~> <%= providerVersion %>"
  region  = "${ var.region }"

  assume_role {
    role_arn = "<%= backendRoleArn %>"
  }
}

terraform {
    backend "<%= backend %>" {
        bucket   = "<%= backendBucketName %>"
        key      = "<%= backendBucketKeyPrefix %>/<%= environment %>/<%= region %>/terraform.tfstate"
        region   = "<%= backendBucketRegion %>"
        role_arn = "<%= backendRoleArn %>"
    }
}
<% } %>
<% if (backend == "local") { %>
provider "<%= provider %>" {
  # provider parameters here.
  version = "~> <%= providerVersion %>"
  region  = "${ var.region }"

  # Local using aws credentials profile
  profile = "default"

  # Override any secrets at run time and avoid storing them in source control
  # access_key = ""
  # secret_key = ""
}

terraform {
  backend "local" {
    path = "<%= backendLocalPathPrefix %>"
  }
}
<% } %>
