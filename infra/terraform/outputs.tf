output "public_ip" {
  description = "IP pública de la VM"
  value       = azurerm_public_ip.sonarqube.ip_address
}

output "sonarqube_url" {
  description = "URL de SonarQube"
  value       = "http://${azurerm_public_ip.sonarqube.ip_address}:9000"
}

output "ssh_command" {
  description = "Comando para conectarse por SSH"
  value       = "ssh ${var.admin_username}@${azurerm_public_ip.sonarqube.ip_address}"
  sensitive   = true
}