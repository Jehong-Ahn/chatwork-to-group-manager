const PresetManager = (data) => {

  if (document.getElementById("_presetList")) 
    document.getElementById("_presetList").remove();

  let toBtn = document.getElementById("_to");
  let toList = document.getElementById("_toList");
  let memberList = toList.getElementsByTagName("ul")[0];
  let members = memberList.getElementsByTagName("li");
  let chat = document.getElementById("_chatText");
  let room;
  let rendered = false; // Is the list rendered for the current room?

  let container = document.createElement("div");
  container.id = "_presetList";
  container.className = "toSelectorTooltip tooltip tooltip--white";
  container.style = `position: absolute; left: 240px; top: -1px; width: 200px; display: block`;;

  let header = document.createElement("div");
  header.className = "tooltip__optionContainer";
  header.style = `height: 57px;`;
  header.textContent = "Preset";
  container.appendChild(header);

  let list = document.createElement("ul");
  list.className = "tooltipList";
  list.style = `height: 160px;`;
  container.appendChild(list);

  let footer = document.createElement("div");
  footer.className = "toSelectorTooltip__footer";
  footer.textContent = "Footer";
  container.appendChild(footer);

  document.getElementById("_toListFooter").after(container);

  

  let form = document.createElement("div");
  form.style.marginTop = "5px";
  
  let inputName = document.createElement("input");
  inputName.style.width = "110px";
  form.appendChild(inputName);
  let btnAdd = document.createElement("button");
  btnAdd.textContent = "Add";
  form.appendChild(btnAdd);
  
  header.appendChild(form);




  const renderItem = (row, i) => {

    let item = document.createElement("li");
    item.className = "tooltipList__item";
    item.setAttribute("key", row[0]);
    item.addEventListener("click", (e)=>{
      if (e.target.nodeName==="BUTTON") return false;
      chat.value = generateMessage(row[2]) + "\n";
      toBtn.click();
      chat.focus();
    });

    let label = document.createElement("p");
    label.className = "autotrim";
    label.style = "width: 70px; margin-right: 5px;";
    label.textContent = row[1];
    item.appendChild(label);

    let avatars = document.createElement("div");
    avatars.className = "avatars autotrim";
    avatars.style = "display: inline-block; width: 79px; margin-right: 5px;";
    item.appendChild(avatars);

    copyAvatar(row[2], avatars);

    let btn = document.createElement("button");
    btn.textContent = "X";
    btn.style = "visibility: hidden; cursor: pointer; font-size: 11px; border: 0;";
    btn.addEventListener("click", async (e)=>{
      let key = e.target.parentNode.getAttribute("key");
      data[room].splice(
        data[room].findIndex((row)=>row[0]===key), 1
      );
      e.target.parentNode.remove();
      console.log('data', data[room]);
      await save();
    });
    item.appendChild(btn);

    item.addEventListener("mouseenter", ()=>{ btn.style.visibility = "visible"; });
    item.addEventListener("mouseleave", ()=>{ btn.style.visibility = "hidden"; });

    return item;
  };

  const render = (roomNo) => {
    room = roomNo;
    console.log(`render for ${room}`);
    rendered = true;

    if (!data[room] || !data[room].length) {
      data[room] = [];
      return console.log('no preset data', data);
    }

    var f = document.createDocumentFragment();
    data[room].forEach((row, i)=>{
      f.appendChild(renderItem(row, i));
    });
    list.appendChild(f);

  };

  const _eachMember = (users, callback) => {
    for(let i=0; i<members.length; i++) {
      let m = members[i];
      let mid = m.getAttribute("data-cwui-lt-value");
      if (users.indexOf(mid)>-1) {
        callback(mid, m);
      }
    }
  }

  const copyAvatar = (users, item) => {
    
    let needOmit = users.length > 3;
    let sliced = users.slice(0, (needOmit ? 2 : 3));
    
    _eachMember(sliced, (mid, m)=>{
      let img = m.getElementsByTagName("img")[0].cloneNode(true);
      img.style = `width: 20px; height: 20px; image-rendering: pixelated;`;
      item.appendChild(img);
    });

    if (needOmit) {
      let omitted = document.createElement("div");
      omitted.style = `
        display: inline-block;
        background-color: #b3b3b3;
        color: white;
        border-radius: 10px;
        padding: 0 3px;
        position: relative;
        top: 2px;
      `;
      omitted.textContent = "+" + (users.length - 2);
      item.appendChild(omitted);
    }

  };

  const generateMessage = users => {
    let lines = [];
    _eachMember(users, (mid, m)=>{
      lines.push(`[To:${mid}] ` + m.getElementsByTagName("p")[0].textContent);
    });
    return lines.join("\n");
  };

  const reset = () => {
    console.log('reset');
    rendered = false;
    while (list.lastChild) {
      list.removeChild(list.lastChild);
    }
  };

  const save = () => {
    return chrome.storage.local.set({data});
  };

  const getRoomId = () => document.location.href.split("!rid")[1];


  toBtn.addEventListener("click", () => {
    if (rendered) return;
    render(getRoomId());
  });

  btnAdd.addEventListener("click", async () => {
      
    let content = chat.value.trim();
    if (!content) {
      memberList.style.backgroundColor = "yellow";
      setTimeout(() => {
        memberList.style.backgroundColor = "inherit";
      }, 1000);
      return false;
    }

    let name = inputName.value.trim();
    if (!name) return inputName.focus();

    let array = content.split("\n")
      .filter(line=>line.substr(0,4)==="[To:")
      .map(line=>/To:(\d+)/.exec(line)[1]);
    if (!array.length) return false;

    let row = [
      Date.now().toString(),
      name,
      array
    ];
    
    let item = renderItem(row);
    list.appendChild(item);
    
    data[room].push(row);
    console.log("data", data);
    await save();

    inputName.value = "";
    item.scrollIntoView();
  });


  console.log("init");

  return { data, render, reset };
};


setTimeout(() => {

  chrome.storage.local.get(['data'], res => {
    
    window.pm = PresetManager(res.data || {});

    window.onpopstate = () => window.pm.reset();

  });

}, 5000);
