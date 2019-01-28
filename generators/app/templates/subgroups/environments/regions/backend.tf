provider "<%= provider %>" {
    # provider parameters here. Override any secrets at run time and avoid storing them in source control
    <% for (i in providerAttributes) { %>
    <%= providerAttributes[i] %> = ""<% } %>
}

<% if (backend == "s3") { %>
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

# FOR LOCAL
# provider "aws" {
#   region  = "us-west-2"
#   profile = "oktad"
# }

terraform {
  backend "local" {
    path = "<%= backendLocalPathPrefix %>"
  }
}
<% } %>
