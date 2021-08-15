var CustomSelectsArrays = [];

class CustomSelect {
  constructor(TargetClass) {
    this.TargetClass = TargetClass;
    this.AllDefaultSelects = Array.from(document.querySelectorAll('select'));
  }

  Init() {
    this.AllDefaultSelects.map(elem => {
      if(elem.classList.contains(this.TargetClass.replace('.', ''))){
        var _select = new Select(this, elem);
        _select.Build();
        CustomSelectsArrays.push(_select);
      }
    });
  }
}

class CustomSelectMulti extends CustomSelect {
  constructor(TargetClass) {
    super(TargetClass);
  }

  Init() {
    this.AllDefaultSelects.map(elem => {
      if(elem.classList.contains(this.TargetClass.replace('.', ''))){
        var _select = new SelectMulti(this, elem);
        _select.Build();
        CustomSelectsArrays.push(_select);
      }
    });
  }
}

//------------------------------------

class Select {
  constructor(selectsEcosystem, select) {
    this.selectsEcosystem = selectsEcosystem;
    this.select = select;
    this.selectDOM = document.createElement('fieldset');
    this.selectDOM.classList.add('custom-select');
    this.selectDOM.classList.add('custom-select-fieldset');
    this.selectInnerDOM = document.createElement('div');
    this.selectInnerDOM.classList.add('custom-select-options');
    this.options = [];
    this.Opened = false;
    document.body.addEventListener('keyup', this.SelectNavigation.bind(this));
    document.body.addEventListener('click', this.Close.bind(this));
  }

  Build() {
    this.Trigger = new SelectTrigger(this, Array.from(this.select.children)[0]);
    this.Trigger.Build();
    Array.from(this.select.children).map(elem => {
      var _option = new SelectOption(this, elem);
      this.options.push(_option);
      _option.Build();
    });
    this.BuildSelectContent();
    this.HideOriginSelect();
  }

  SelectNavigation(event) {
    switch(event.key.toLowerCase()) {
      case 'tab':
        if(document.activeElement === this.select) {
          this.Open();
        }
        else {
          this.Close();
        }
        break;
      default:
        if(event.key.toLowerCase() == 'arrowup' || event.key.toLowerCase() == 'arrowdown' && this.Opened) {
          switch(event.key.toLowerCase()) {
            case 'arrowup':
              if(this.OptionIndex > 0) {
                this.OptionIndex--;
              }
              else {
                this.OptionIndex = this.options.length - 1;
              }
              break;
            case 'arrowdown':
              if(this.OptionIndex < this.options.length - 1) {
                this.OptionIndex++;
              }
              else {
                this.OptionIndex = 0;
              }
              break;
          }
          this.options[this.OptionIndex].Focus();
        }
        break;
    }
  }

  BuildSelectContent() {
    this.selectDOM.appendChild(this.selectInnerDOM);
    this.select.parentNode.insertBefore(this.selectDOM, this.select.nextSibling);
  }

  HideOriginSelect() {
    //==== dissimulation du select origine et conservation du focus
    this.select.style.opacity = '0';
    this.select.style.width = '0';
    this.select.style.height = '0';
    this.select.style.padding = '0';
    this.select.style.margin = '0';
    this.select.style.height = '0';
    this.select.style.overflow = 'hidden';
    this.select.style.position = 'fixed';
    this.select.style.top = '-1000px';
    //====================================
  }

  Open() {
    CustomSelectsArrays.map(elem => {
      elem.Close();
    });
    this.OptionIndex = 0;
    this.Opened = true;
    this.selectInnerDOM.classList.add("show");
    this.Trigger.triggerDOM.classList.add('arrow-up');
    this.select.style.visibility = 'hidden';
  }

  Close() {
    this.Opened = false;
    this.selectInnerDOM.classList.remove("show");
    this.Trigger.triggerDOM.classList.remove('arrow-up');
    if(this.selectInnerDOM.querySelectorAll('.hover').length != 0) {
      this.selectInnerDOM.querySelectorAll('.hover')[0].classList.remove('hover');
    }
    this.select.style.visibility = '';
  }
}

class SelectMulti extends Select {
  constructor(selectsEcosystem, select) {
    super(selectsEcosystem, select);
  }

  Build() {
    this.Trigger = new SelectTrigger(this, Array.from(this.select.children)[0]);
    this.Trigger.Build();
    var _index = 0;
    Array.from(this.select.children).map(elem => {
      if(_index > 0) {
        var _option = new SelectOptionMulti(this, elem);
        this.options.push(_option);
        _option.Build();
      }
      _index++;
    });
    this.select.removeAttribute('name');
    this.BuildSelectContent();
    this.HideOriginSelect();
  }
}

//------------------------------------

class SelectOption {
  constructor(select, option) {
    this.select = select;
    this.option = option;
    this.optionWrapper = document.createElement('div');
    this.LabelDOM = document.createElement('label');
    this.value = this.option.getAttribute('value');
    this.Focused = false;
    document.body.addEventListener('keyup', this.Fire.bind(this));
    this.optionWrapper.addEventListener('click', this.Click.bind(this));
  }

  Build() {
    this.LabelDOM.innerHTML = this.option.innerHTML;
    this.LabelDOM.dataset.value = this.value;
    this.optionWrapper.appendChild(this.LabelDOM);
    this.select.selectInnerDOM.appendChild(this.optionWrapper);
  }

  Focus() {
    this.select.options.map(elem => {
      elem.Focused = false;
      elem.LabelDOM.classList.remove('hover');
    });
    this.Focused = true;
    this.LabelDOM.classList.add('hover');
  }

  Fire(event) {
    if(this.select.Opened && this.Focused && event.key.toLowerCase() == ' ') {
      this.Click(event);
    }
  }

  Click(event) {
    event.stopPropagation();
    this.select.Trigger.triggerDOM.innerHTML = this.LabelDOM.innerHTML;
    this.select.select.value = this.value;
  }
}

class SelectOptionMulti extends SelectOption {
  constructor(select, option) {
    super(select, option);
    this.inputDOM = document.createElement('input');
  }

  Build() {
    this.inputDOM.setAttribute('type', 'checkbox');
    this.inputDOM.setAttribute('value', this.value);
    this.inputDOM.setAttribute('name', this.select.select.getAttribute('name'));
    this.LabelDOM.innerHTML = this.option.innerHTML;
    this.optionWrapper.appendChild(this.inputDOM);
    this.optionWrapper.appendChild(this.LabelDOM);
    this.select.selectInnerDOM.appendChild(this.optionWrapper);
  }

  Click(event) {
    event.stopPropagation();
    this.inputDOM.click();
  }
}

//------------------------------------

class SelectTrigger {
  constructor(select, trigger) {
    this.select = select;
    this.trigger = trigger;
    this.triggerDOM = document.createElement('label');

  }

  Build() {
    this.triggerDOM.classList.add('custom-select-trigger');
    this.triggerDOM.innerHTML = this.trigger.innerHTML;
    this.select.selectDOM.appendChild(this.triggerDOM);
    this.Init();
  }

  Init() {
    this.triggerDOM.addEventListener("click", this.TriggerSelect.bind(this));
  }
  
  TriggerSelect(event) {
    event.stopPropagation();
    if(this.select.Opened) {
      this.CloseSelect();
    }
    else {
      this.OpenSelect();
    }
  }

  OpenSelect() {
    this.select.Open();
  }

  CloseSelect() {
    this.select.Close();
  }
}