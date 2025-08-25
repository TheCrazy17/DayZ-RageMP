// Definición de categorías y sus ítems
let inventoryCategory = {
    "Armas primarias": ["Heavy Sniper", "Heavy Sniper Mk II", "Heavy Rifle", "Carbine Rifle Mk II"],
    "Armas secundarias": ["Glock 17", "M1911"],
    "Armas especiales": ["Grenade"],
    "Municiones": ["9mm Mag", "AK Mag"],
    "Consumibles": ["Lata de frijoles", "Agua"],
};

// ----- API estilo MTA -----
function createWindow(x,y,w,h,title){
    let win=document.createElement("div");
    win.className="gui-window";
    win.style.left=x+"px"; win.style.top=y+"px"; win.style.width=w+"px"; win.style.height=h+"px";

    let header=document.createElement("div");
    header.className="gui-title";
    header.innerText=title;
    win.appendChild(header);

    document.getElementById("ui-root").appendChild(win);

    // Drag
    let offX, offY, drag=false;
    header.addEventListener("mousedown",e=>{drag=true;offX=e.clientX-win.offsetLeft;offY=e.clientY-win.offsetTop;});
    document.addEventListener("mouseup",()=>drag=false);
    document.addEventListener("mousemove",e=>{
    	if(drag){win.style.left=(e.clientX-offX)+"px";win.style.top=(e.clientY-offY)+"px";}
    });

    return win;
}

    function createButton(parent, text, x, y, w, h, onClick) {
        let btn = document.createElement("button");
        btn.className = "gui-button";
        btn.innerText = text;
        btn.style.position = "absolute";      // Posicionamiento absoluto
        btn.style.left = x + "px";
        btn.style.top = y + "px";
        btn.style.width = w + "px";
        btn.style.height = h + "px";
        btn.onclick = onClick;
        parent.appendChild(btn);
        return btn;
    }
    function createLabel(parent, text, x, y, w, h, options={}) {
    let label = document.createElement("div");
    label.className = "gui-label";
    label.innerText = text;
    label.style.position = "absolute";
    label.style.left = x + "px";
    label.style.top = y + "px";
    if (w) label.style.width = w + "px";
    if (h) label.style.height = h + "px";

    // Opciones de estilo adicionales
    if (options.color) label.style.color = options.color;
    if (options.background) label.style.background = options.background;
    if (options.fontSize) label.style.fontSize = options.fontSize + "px";
    if (options.textAlign) label.style.textAlign = options.textAlign;
    if (options.padding) label.style.padding = options.padding + "px";

    parent.appendChild(label);
    return label;
}
    function createGridList(parent,x, y, w, h){
      let grid=document.createElement("div");
      grid.className="gui-grid";
      //grid.style.width=w+"px"; grid.style.height=h+"px";
        grid.style.position = "absolute";      // Posicionamiento absoluto
        grid.style.left = x + "px";
        grid.style.top = y + "px";
        grid.style.width = w + "px";
        grid.style.height = h + "px";
      parent.appendChild(grid);
      return grid;
    }
  /*function gridListAddRow(grid, name, qty) {
    let row = document.createElement("div");
    row.className = "gui-row";

    let nameSpan = document.createElement("span");
    nameSpan.innerText = name;
    row.appendChild(nameSpan);

    let qtySpan = document.createElement("span");
    qtySpan.innerText = qty;  // cantidad
    row.appendChild(qtySpan);

    grid.appendChild(row);

    // manejo de selección
    row.addEventListener("click", () => {
        Array.from(grid.getElementsByClassName("gui-row")).forEach(r => r.classList.remove("selected"));
        row.classList.add("selected");
    });

    
    // Menú contextual con click derecho
    row.addEventListener("contextmenu", (e) => {
        //e.preventDefault(); // Evita menú por defecto
        Array.from(grid.getElementsByClassName("gui-row")).forEach(r => r.classList.remove("selected"));
        row.classList.add("selected");

        // Abrir menú contextual
        showContextMenu(e.clientX, e.clientY, name);
    });
  
    return row;
}*/

    function gridListAddRow(grid, name, qty) {
    let row = document.createElement("div");
    row.className = "gui-row";
    row.draggable = true; // 🔹 Se puede arrastrar

    let nameSpan = document.createElement("span");
    nameSpan.innerText = name;
    row.appendChild(nameSpan);

    let qtySpan = document.createElement("span");
    qtySpan.innerText = qty;
    row.appendChild(qtySpan);

    grid.appendChild(row);

// manejo de selección con click
row.addEventListener("click", () => {
	Array.from(grid.getElementsByClassName("gui-row")).forEach(r => r.classList.remove("selected"));
	row.classList.add("selected");
});

        
    // Menú contextual con click derecho
    row.addEventListener("contextmenu", (e) => {
        //e.preventDefault(); // Evita menú por defecto
        Array.from(grid.getElementsByClassName("gui-row")).forEach(r => r.classList.remove("selected"));
        row.classList.add("selected");

        // Abrir menú contextual
        showContextMenu(e.clientX, e.clientY, name);
    });

    // 🔹 Guardar datos del item al arrastrar
    row.addEventListener("dragstart", e => {
        e.dataTransfer.setData("text/plain", JSON.stringify({ name, qty }));
    });

    return row;
}

function enableDrop(grid, type) {
    grid.addEventListener("dragover", e => {
        e.preventDefault(); // necesario para permitir drop
    });

    grid.addEventListener("drop", e => {
        e.preventDefault();
        let data = JSON.parse(e.dataTransfer.getData("text/plain"));
        
        if(type === "loot"){
            console.log("Item '" + data.name + "' se movió al loot!");
            // acá podrías llamar a tu backend / lógica para mover al loot
        } else if(type === "inventory"){
            console.log("Item '" + data.name + "' se movió al inventario!");
            // acá lo mueves al inventario
        }
    });
}

    function gridListAddCategory(grid,text){
      let cat=document.createElement("div");
      cat.className="gui-category";
      cat.innerText=text;
      grid.appendChild(cat);
      return cat;
    }
    
    /*function gridListGetSelectedItem(grid){
      let selected=grid.querySelector(".gui-row.selected");
      return selected ? selected.innerText : null;
    }*/

    function gridListGetSelectedItem(grid){
        let selected = grid.querySelector(".gui-row.selected");
        if(selected){
            // Primer span = nombre del ítem
            return selected.querySelector("span").innerText;
        }
        return null;
    }

    // ----- Context Menu -----
    const ctx=document.getElementById("contextMenu");
    function showContextMenu(x,y,itemText){
      ctx.innerHTML=""; // limpiar menú

      // Opciones diferentes según item
      let options=[];
      if(itemText.includes("Rifle")||itemText.includes("Escopeta")||itemText.includes("Pistola")){
        options=["Equipar","Soltar"];
      } else if(itemText.includes("Agua")||itemText.includes("Lata")||itemText.includes("Comida")){
        options=["Consumir","Soltar"];
      } else if(itemText.includes("Botiquín")||itemText.includes("Analgésicos")){
        options=["Usar","Soltar"];
      } else {
        options=["Inspeccionar","Soltar"];
      }

      options.forEach(opt=>{
        let div=document.createElement("div");
        div.className="context-item";
        div.innerText=opt;
        div.onclick=()=>{
          console.log(opt+" → "+itemText);
          ctx.style.display="none";
        };
        ctx.appendChild(div);
      });

      ctx.style.left=x+"px"; ctx.style.top=y+"px";
      ctx.style.display="block";
    }

    // Ocultar menú al hacer click afuera
    document.addEventListener("click",()=>ctx.style.display="none");

    // ----- Inventario -----
    let invWindow=createWindow(300,100,700,450,"Inventario");
    let grid=createGridList(invWindow,420, 40, 250,355);
    

    createLabel(invWindow, "Slots: 0/0", 10, 420, 260, 20, {fontSize:14, textAlign:"center"});
    createLabel(invWindow, "Slots: 9/16", 420, 420, 250, 20, {fontSize:14, textAlign:"center"});
  
    gridListAddCategory(grid,"Armas Primarias");
    gridListAddRow(grid,"Rifle de asalto", "1");
    gridListAddRow(grid,"Escopeta", "2");

    gridListAddCategory(grid,"Armas Secundarias");
    gridListAddRow(grid,"Pistola", "1");

    gridListAddCategory(grid,"Medicinas");
    gridListAddRow(grid,"Botiquín", "9");
    gridListAddRow(grid,"Analgésicos", "10");

    gridListAddCategory(grid,"Comida y Agua");
    gridListAddRow(grid,"Agua", "1");
    gridListAddRow(grid,"Lata de frijoles", "2");
    gridListAddRow(grid,"Lata de frijoles", "2");
    gridListAddRow(grid,"Lata de frijoles", "2");
    gridListAddRow(grid,"Lata de frijoles", "2");
    gridListAddRow(grid,"Lata de frijoles", "2");
    gridListAddRow(grid,"Lata de frijoles", "2");
    gridListAddRow(grid,"Lata de frijoles", "2");

    
    let grid2=createGridList(invWindow,20, 40, 250,355);
    gridListAddCategory(grid2,"Armas Primarias");
    gridListAddCategory(grid2,"Armas Secundarias");
    gridListAddCategory(grid2,"Armas Especiales");
    gridListAddCategory(grid2,"Medicina");
    gridListAddRow(grid2,"Lata de frijoles", "2");

// Botón dentro del inventario
  createButton(invWindow, "<", 375, 40, 30, 315, () => {
    let item = gridListGetSelectedItem(grid);
    if(item) console.log("Usaste: " + item);
  });

  createButton(invWindow, "<<", 375, 365, 30, 40, () => {
    let item = gridListGetSelectedItem(grid);
    if(item) console.log("Usaste: " + item);
  });

// Botón dentro del inventario
createButton(invWindow, ">", 295, 40, 30, 315, () => {
	let item = gridListGetSelectedItem(grid2);
	if(item) mp.trigger('onClientTakeLoot', item);
});

  createButton(invWindow, ">>", 295, 365, 30, 40, () => {
    let item = gridListGetSelectedItem(grid2);
    if(item) console.log("Usaste: " + item);
  });

  
enableDrop(grid, "inventory");
enableDrop(grid2, "loot");

// Inventario de prueba
let inventoryData = {
    "Armas Primarias": [
        { name: "M4A1", qty: 1 }
    ],
    "Armas Secundarias": [
        { name: "Glock 17", qty: 1 }
    ],
    "Munición": [
      { name: "Stanag MAG", qty: 60 }
    ],
    "Medicinas": [
        { name: "Botiquín", qty: 9 },
        { name: "Analgésicos", qty: 10 }
    ],
    "Comida y Agua": [
    ]
};

// Refrescar el grid del inventario
function refreshGrid(grid, data = []) {
    // limpiar todo lo que tiene (rows y categorías)
    grid.innerHTML = "";
    ctx.style.display = "none";

    if (!data) return;

    // 🔹 Si viene como string JSON, parseamos
    if (typeof data === "string") {
        try {
            data = JSON.parse(data);
        } catch (e) {
            console.error("Error parseando loot:", e, data);
            return;
        }
    }

    // 🔹 Recorremos categorías fijas
    for (let category in inventoryCategory) {
        // Agregar la categoría al grid
        gridListAddCategory(grid, category);

        // Revisar todos los ítems de esa categoría
        inventoryCategory[category].forEach(itemName => {
            if (data.includes(itemName)) {
                gridListAddRow(grid, itemName, 1);
            }
        });
    }
}

// Ejemplo: refrescar inventario al apretar tecla "R"
window.addEventListener("keydown", e => {
    if (e.key.toLowerCase() === "r") {
        refreshGrid(grid, []);
    }
});

document.addEventListener("contextmenu", (e) => {
	e.preventDefault();
});

// Toggle con J
mp.events.add('showInventory', (state) => {
	invWindow.style.display = state ? "block" : "none";
});

mp.events.add('refreshLootPoint', (LootData) => {
  refreshGrid(grid2, LootData);
});

document.ondragover = e => e.preventDefault();
document.addEventListener("drop",e=>{
    e.preventDefault();
    // si el drop no es dentro de la ventana de inventario => tirar al suelo
    if(!e.target.closest(".gui-window")){
        let data=JSON.parse(e.dataTransfer.getData("text/plain"));
        console.log("Item '"+data.name+"' se tiró al SUELO");
    }
});
