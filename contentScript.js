const PresetManager = ()=>{

  if (document.getElementById("_presetList")) 
      document.getElementById("_presetList").remove();

  let toBtn = document.getElementById("_to");
  let toList = document.getElementById("_toList");
  let memberList = toList.getElementsByTagName("ul")[0];
  let members = memberList.getElementsByTagName("li");
  let chat = document.getElementById("_chatText");
  let room;

  let data = {
      '57467026': [
          [ "1", "프리셋1", [ "2030037", "2095520", "2100306", "1954882", "351335" ] ],
          [ "2", "프리셋2", [ "2030037", "2095520", "2100306" ] ],
          [ "3", "프리셋3", [ "2030037", "2095520", "2100306" ] ],
          [ "4", "프리셋4", [ "2030037", "2095520", "2100306" ] ],
          [ "5", "프리셋5", [ "2030037", "2095520", "2100306" ] ],
          [ "6", "프리셋6", [ "2030037", "2095520", "2100306" ] ],
      ]
  };

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
      data[room].push(row);
      let item = renderItem(row);
      list.appendChild(item);
      console.log("data", data);
      await save();

      inputName.value = "";
      item.scrollIntoView();
  });
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
      avatars.style = "display: inline-block; width: 73px; margin-right: 5px;";
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
      
      console.log("Start to render");
      room = roomNo;
      reset();
      toBtn.click();
      toBtn.click();

      if (!data[roomNo] || !data[roomNo].length) {
          return console.log('no preset data');
      }

      var f = document.createDocumentFragment();
      data[roomNo].forEach((row, i)=>{
          f.appendChild(renderItem(row, i));
      });
      list.appendChild(f);

  };

  const _eachMember = (users, callback) => {
      for(let i=0; i<members.length; i++) {
          let m = members[i];
          let mid = m.getAttribute("data-cwui-lt-value");
          if (users.slice(0, 3).indexOf(mid)>-1) {
              callback(mid, m);
          }
      }
  }

  const copyAvatar = (users, item) => {
      _eachMember(users, (mid, m)=>{
          let img = m.getElementsByTagName("img")[0].cloneNode(true);
          img.style = `width: 20px; height: 20px; image-rendering: pixelated;`;
          item.appendChild(img);            
      });
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
      while (list.lastChild) {
          list.removeChild(list.lastChild);
      }
  };

  const save = () => {
      return true;
  };

  return { render };
};


setTimeout(() => {

  window.presetManager = PresetManager();

  window.presetManager.render(document.location.href.split("!rid")[1]);

  window.onpopstate = () => {
    window.presetManager.render(document.location.href.split("!rid")[1]);
  };
  
}, 5000);
