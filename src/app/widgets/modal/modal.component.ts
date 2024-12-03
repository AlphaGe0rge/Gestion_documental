import { Component, ContentChild, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {

  @Input() modalTitle: string = 'Default Modal Title';
  @Input() modalSize: 'small' | 'medium' | 'large' = 'medium'; // Tamaño del modal
  @Input() showConfirm: boolean = true;
  @Input() showCloseConfirm: boolean = true; 
  @Input() modalId: string = 'defaultModalId'; // Identificador único para el modal
  @Input() hasCustomFooter: boolean = false; 

  
  @Output() confirm = new EventEmitter<void>(); // Evento de confirmación
  @Output() modalClose = new EventEmitter<void>(); // Evento de confirmación

  isOpen: boolean = false; // Estado del modal

  constructor() { }

  ngOnInit(): void {
  }

  // Método para cerrar el modal
  closeModal() {

    this.isOpen = false;

    const modalElement = document.getElementById(this.modalId);
    if (modalElement) {
      // Ocultar el modal
      (modalElement as any).style.display = 'none';
      (modalElement as any).classList.remove('show');
  
      // Eliminar el backdrop relacionado
      const backdrop = document.querySelector(`.modal-backdrop[data-backdrop-id="${this.modalId}"]`);
      if (backdrop) {
        backdrop.remove();
      }
  
      // Verificar si quedan otros modales abiertos
      const remainingModals = document.querySelectorAll('.modal.show');
      if (remainingModals.length === 0) {
        document.body.classList.remove('modal-open');
      }
    }
    this.modalClose.emit();
  }
  

    // Método para confirmar, pero sin cerrar el modal
    confirmModal(close: boolean) {
      this.confirm.emit(); // Emitimos el evento sin cerrar el modal
      if (close) this.closeModal();
    }
  
    // Método para abrir el modal
    openModal() {

      this.isOpen = true;

      setTimeout(() => {
        document.getElementById(this.modalId)?.focus(); // Asegura el foco en el modal

        const modalElement = document.getElementById(this.modalId);

        if (modalElement) {
          // Mostrar el modal actual
          (modalElement as any).style.display = 'block';
          (modalElement as any).classList.add('show');
  
          // Al abrir el modal
          (modalElement as any).removeAttribute('inert');
          document.body.classList.add('modal-open');
      
          // Crear un nuevo backdrop con z-index dinámico
          const backdrop = document.createElement('div');
          backdrop.className = 'modal-backdrop fade show';
          backdrop.setAttribute('data-backdrop-id', this.modalId);
      
          // Calcular z-index dinámico
          const activeModals = document.querySelectorAll('.modal.show');
          const baseZIndex = 1050; // Base z-index
          const newZIndex = baseZIndex + activeModals.length * 10;
          (modalElement as any).style.zIndex = newZIndex + 10; // Modal por encima del backdrop
          backdrop.style.zIndex = `${newZIndex}`; // Backdrop justo debajo del modal
      
          document.body.appendChild(backdrop);
        }

      }, 0);

    }
    
}
