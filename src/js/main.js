/*
*   This content is licensed according to the W3C Software License at
*   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
*
*   Supplemental JS for the disclosure menu keyboard behavior
*/

class DisclosureNav {
  constructor(domNode) {
    this.rootNode = domNode;
    this.triggerNodes = [];
    this.controlledNodes = [];
    this.openIndex = null;
    this.useArrowKeys = true;
  }

  init() {
    const buttons = this.rootNode.querySelectorAll('button[aria-expanded][aria-controls]');
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const menu = button.parentNode.querySelector('ul');
      if (menu) {
        // save ref to button and controlled menu
        this.triggerNodes.push(button);
        this.controlledNodes.push(menu);

        // collapse menus
        button.setAttribute('aria-expanded', 'false');
        this.toggleMenu(menu, false);

        // attach event listeners
        menu.addEventListener('keydown', (event) => {
          this.handleMenuKeyDown(event);
        });
        button.addEventListener('click', (event) => {
          this.handleButtonClick(event);
        });
        button.addEventListener('keydown', (event) => {
          this.handleButtonKeyDown(event);
        });
      }
    }

    this.rootNode.addEventListener('focusout', () => {
      this.handleBlur();
    });
  }

  toggleMenu(domNode, show) {
    if (domNode) {
      domNode.style.display = show ? 'block' : 'none';
    }
  }

  toggleExpand(index, expanded) {
    // close open menu, if applicable
    if (this.openIndex !== index) {
      this.toggleExpand(this.openIndex, false);
    }

    // handle menu at called index
    if (this.triggerNodes[index]) {
      this.openIndex = expanded ? index : null;
      this.triggerNodes[index].setAttribute('aria-expanded', expanded);
      this.toggleMenu(this.controlledNodes[index], expanded);
    }
  }

  controlFocusByKey(keyboardEvent, nodeList, currentIndex) {
    switch (keyboardEvent.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        keyboardEvent.preventDefault();
        if (currentIndex > -1) {
          const prevIndex = Math.max(0, currentIndex - 1);
          nodeList[prevIndex].focus();
        }
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        keyboardEvent.preventDefault();
        if (currentIndex > -1) {
          const nextIndex = Math.min(nodeList.length - 1, currentIndex + 1);
          nodeList[nextIndex].focus();
        }
        break;
      case 'Home':
        keyboardEvent.preventDefault();
        nodeList[0].focus();
        break;
      case 'End':
        keyboardEvent.preventDefault();
        nodeList[nodeList.length - 1].focus();
        break;
    }
  }

  handleBlur(event) {
    const menuContainsFocus = this.rootNode.contains(event.relatedTarget);
    if (!menuContainsFocus && this.openIndex !== null) {
      this.toggleExpand(this.openIndex, false);
    }
  }

  handleButtonKeyDown() {
    const targetButtonIndex = this.triggerNodes.indexOf(document.activeElement);

    // close on escape
    if (event.key === 'Escape') {
      this.toggleExpand(this.openIndex, false);
    }

    // move focus into the open menu if the current menu is open
    else if (this.useArrowKeys && this.openIndex === targetButtonIndex && event.key === 'ArrowDown') {
      event.preventDefault();
      this.controlledNodes[this.openIndex].querySelector('a').focus();
    }

    // handle arrow key navigation between top-level buttons, if set
    else if (this.useArrowKeys) {
      this.controlFocusByKey(event, this.triggerNodes, targetButtonIndex);
    }
  }

  handleButtonClick(event) {
    const button = event.currentTarget;
    const buttonIndex = this.triggerNodes.indexOf(button);
    const buttonExpanded = button.getAttribute('aria-expanded') === 'true';
    this.toggleExpand(buttonIndex, !buttonExpanded);
  }

  handleMenuKeyDown(event) {
    if (this.openIndex === null) {
      return;
    }

    const menuLinks = Array.prototype.slice.call(this.controlledNodes[this.openIndex].querySelectorAll('a'));
    const currentIndex = menuLinks.indexOf(document.activeElement);

    // close on escape
    if (event.key === 'Escape') {
      this.triggerNodes[this.openIndex].focus();
      this.toggleExpand(this.openIndex, false);
    }

    // handle arrow key navigation within menu links, if set
    else if (this.useArrowKeys) {
      this.controlFocusByKey(event, menuLinks, currentIndex);
    }
  }

  updateKeyControls(useArrowKeys) {
    this.useArrowKeys = useArrowKeys;
  }
}


document.documentElement.classList.add('js-enabled');

/* Initialize Disclosure Menus */

window.addEventListener('load', function (event) {
  let i;
  const menus = document.querySelectorAll('.disclosure-nav');
  const disclosureMenus = [];

  for (i = 0; i < menus.length; i++) {
    disclosureMenus[i] = new DisclosureNav(menus[i]);
    disclosureMenus[i].init();
  }

  // listen to arrow key checkbox
  const arrowKeySwitch = document.getElementById('arrow-behavior-switch');
  arrowKeySwitch.addEventListener('change', function (event) {
    const checked = arrowKeySwitch.checked;
    for (let i = 0; i < disclosureMenus.length; i++) {
      disclosureMenus[i].updateKeyControls(checked);
    }
  });

  // fake link behavior
  const links = document.querySelectorAll('[href="#mythical-page-content"]');
  const examplePageHeading = document.getElementById('mythical-page-heading');
  for (i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function (event) {
      examplePageHeading.innerText = event.currentTarget.innerText;
      // handle aria-current
      for (let n = 0; n < links.length; n++) {
        links[n].removeAttribute('aria-current');
      }
      this.setAttribute('aria-current', 'page');
    });
  }
}, false);