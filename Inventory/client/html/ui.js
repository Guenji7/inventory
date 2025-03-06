document.addEventListener('DOMContentLoaded', () => {
  initializeSlots();
});

function initializeSlots() {
  // Alle Slot-Typen initialisieren
  document.querySelectorAll('.inventory-slot, .equipment-slot, .quickaccess-slot').forEach(slot => {
      slot.addEventListener('dragover', handleDragOver);
      slot.addEventListener('drop', handleDrop);
      slot.addEventListener('dragstart', handleDragStart);
      slot.addEventListener('dragleave', handleDragLeave);
  });

  // Müll-Container initialisieren
  const discardContainer = document.querySelector('.discard-container');
  if (discardContainer) {
      discardContainer.addEventListener('dragover', handleDiscardDragOver);
      discardContainer.addEventListener('drop', handleDiscardDrop);
      discardContainer.addEventListener('dragleave', handleDiscardDragLeave);
  }
}

function handleDragStart(e) {
  if (!e.target.classList.contains('item')) return;
  
  e.target.classList.add('dragging');
  e.dataTransfer.setData('text/plain', JSON.stringify({
      itemId: e.target.dataset.itemId,
      sourceContainer: e.target.closest('[data-container]').dataset.container,
      sourceSlot: parseInt(e.target.closest('[data-slot]').dataset.slot)
  }));
}

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  const slot = e.currentTarget;
  slot.classList.remove('drag-over');

  try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const targetContainer = slot.closest('[data-container]').dataset.container;
      const targetSlot = parseInt(slot.dataset.slot);

      // Prüfe ob der Slot gesperrt ist
      if (slot.classList.contains('locked')) {
          return;
      }

      // An Alt:V Client senden
      alt.emit('moveItem', {
          fromContainer: data.sourceContainer,
          fromSlot: data.sourceSlot,
          toContainer: targetContainer,
          toSlot: targetSlot,
          itemId: data.itemId
      });
  } catch (error) {
      console.error('Fehler beim Item Drop:', error);
  }
}

function handleDiscardDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('dragover');
}

function handleDiscardDragLeave(e) {
  e.currentTarget.classList.remove('dragover');
}

function handleDiscardDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('dragover');

  try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      
      // An Alt:V Client senden
      alt.emit('dropItem', {
          itemId: data.itemId,
          fromContainer: data.sourceContainer,
          fromSlot: data.sourceSlot
      });
  } catch (error) {
      console.error('Fehler beim Item Wegwerfen:', error);
  }
}

// Update Inventar wenn Daten vom Server kommen
alt.on('updateInventory', (inventoryData) => {
  updateInventoryDisplay(inventoryData);
  updateWeightDisplay(inventoryData);
});

function updateInventoryDisplay(inventoryData) {
  if (!inventoryData) return;

  // Hauptinventar aktualisieren
  updateContainer('main', inventoryData.mainSlots);
  
  // Equipment aktualisieren
  updateContainer('equipment', inventoryData.equipment);
  
  // Quickslots aktualisieren
  updateContainer('quickslots', inventoryData.quickSlots);
}

function updateContainer(containerType, items) {
  const container = document.querySelector(`[data-container="${containerType}"]`);
  if (!container) return;

  // Alle Slots leeren
  container.querySelectorAll('[data-slot]').forEach(slot => {
      slot.innerHTML = '';
  });

  // Items einfügen
  items.forEach(item => {
      if (!item) return;
      
      const slot = container.querySelector(`[data-slot="${item.slot}"]`);
      if (!slot) return;

      const itemElement = createItemElement(item);
      slot.appendChild(itemElement);
  });
}

function createItemElement(item) {
  const div = document.createElement('div');
  div.className = 'item';
  div.draggable = true;
  div.dataset.itemId = item.itemId;
  
  div.innerHTML = `
      <div class="item-icon">${item.name.charAt(0)}</div>
      <div class="item-info">
          <span class="item-name">${item.name}</span>
          ${item.amount > 1 ? `<span class="item-amount">${item.amount}</span>` : ''}
          <span class="item-weight">${item.weight}kg</span>
      </div>
  `;
  
  return div;
}

function updateWeightDisplay(inventoryData) {
  const weightLabel = document.querySelector('.weight-label');
  if (weightLabel && inventoryData.currentWeight !== undefined && inventoryData.maxWeight !== undefined) {
      weightLabel.textContent = `⚖️ ${inventoryData.currentWeight.toFixed(1)} / ${inventoryData.maxWeight} kg`;
  }
}

// Fehleranzeige
alt.on('inventoryError', (message) => {
  // Hier könnte eine Toastmeldung oder ähnliches angezeigt werden
  console.error(message);
});