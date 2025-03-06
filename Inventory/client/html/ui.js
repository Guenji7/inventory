document.addEventListener('DOMContentLoaded', () => {
    const inventoryGrid = document.querySelector('.inventory-grid');
    const totalSlots = 7 * 5;

  
    // Drag & Drop Funktionalität (Grundgerüst)
    document.querySelectorAll('.inventory-slot, .equipment-slot, .quickaccess-slot').forEach(slot => {
      slot.addEventListener('dragover', e => e.preventDefault());
      slot.addEventListener('drop', handleDrop);
      slot.addEventListener('dragstart', handleDragStart);
    });
  });
  
  function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
  }
  
  function handleDrop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const draggedElement = document.getElementById(id);
    // Hier könnte man die Inventarlogik implementieren
  }
  
  // Drag & Drop für Wegwerf-Button
  const discardContainer = document.querySelector('.discard-container');
  
  discardContainer.addEventListener('dragover', e => {
    e.preventDefault();
    discardContainer.classList.add('dragover');
  });
  
  discardContainer.addEventListener('dragleave', () => {
    discardContainer.classList.remove('dragover');
  });
  
  discardContainer.addEventListener('drop', e => {
    e.preventDefault();
    discardContainer.classList.remove('dragover');
    // Hier Wegwerf-Logik implementieren
    console.log('Item wurde weggeworfen');
  });