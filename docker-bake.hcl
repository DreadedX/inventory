variable "TAG_BASE" {}

group "default" {
  targets = ["server", "printer"]
}

target "docker-metadata-action" {}

target "server" {
  inherits = ["docker-metadata-action"]
  context = "./"
  dockerfile = "Dockerfile"
  platforms = ["linux/amd64"]
  target = "server"
  tags = [for tag in target.docker-metadata-action.tags : "${TAG_BASE}/server:${tag}"]
}

target "printer" {
  inherits = ["docker-metadata-action"]
  context = "./"
  dockerfile = "Dockerfile"
  platforms = ["linux/arm/v6"]
  target = "printer"
  tags = [for tag in target.docker-metadata-action.tags : "${TAG_BASE}/printer:${tag}"]
}
