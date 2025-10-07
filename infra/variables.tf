variable "project_name" {
  description = "Nombre del proyecto"
  type        = string
  default     = "sonarqube-burgerhouse"
}

variable "resource_group_name" {
  description = "Nombre del Resource Group"
  type        = string
  default     = "rg-sonarqube-burgerhouse"
}

variable "location" {
  description = "Región de Azure"
  type        = string
  default     = "East US"
}

variable "vm_size" {
  description = "Tamaño de la VM"
  type        = string
  default     = "Standard_B2s"
}

variable "admin_username" {
  description = "Usuario admin de la VM"
  type        = string
  default     = "azureuser"
}

variable "admin_password" {
  description = "Contraseña del admin"
  type        = string
  sensitive   = true
}