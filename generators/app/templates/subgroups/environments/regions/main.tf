variable "application_group" {}
variable "account" {}
variable "business_owner" {}
variable "environment" {}
variable "region" {}

# Add additional variables here

<% for (i in components) { %>
module "<%= components[i] %>" {
    source            = "../../../modules/<%= components[i] %>"
    # other variables to be passed in go here
    environment       = "${var.environment}"
    region            = "${var.region}"
    account           = "${var.account}"
    business_owner    = "${var.business_owner}"
    application_group = "${var.application_group}"
}
<% } %>

