import Vue from 'vue'

Vue.directive('only-number', {
  inserted: (el, binding) => {
    const eventListener = (event) => {
      const value = event.target.value
      const validCharacters =
        (event.charCode >= 48 && event.charCode <= 57) ||
        event.charCode === 46 ||
        event.charCode === 0

      if (!validCharacters) {
        return event.preventDefault()
      }

      if (value.includes('.')) {
        if (event.charCode === 46) event.preventDefault()
      }
    }
    el?.addEventListener('keypress', eventListener)
  },
})

Vue.directive('only-date', {
  inserted: (el, binding) => {
    const eventListener = (event) => {
      const validCharacters =
        (event.charCode >= 48 && event.charCode <= 57) ||
        event.charCode === 45 ||
        event.charCode === 0

      if (!validCharacters) {
        event.preventDefault()
      }
    }

    let elementToListenToEvent = el

    const appendToChild = binding?.value?.isAppendToChild
    const childClass = binding?.value?.childClass

    if (appendToChild === true) {
      elementToListenToEvent = el.querySelector(`.${childClass}`)
    }

    elementToListenToEvent?.addEventListener('keypress', eventListener)
  },
})

Vue.directive('auto-focus', {
  inserted: (el) => el.focus(),
})

Vue.directive('click-outside', {
  bind: (element, binding, vnode) => {
    element.clickOutsideEvent = (event) => {
      const isClickedOutside =
        element !== event.target && !element.contains(event.target)

      if (isClickedOutside) {
        vnode.context[binding.expression](event)
      }
    }
    window.addEventListener('click', element.clickOutsideEvent)
  },
  unbind: (element) => {
    window.removeEventListener('click', element.clickOutsideEvent)
  },
})

Vue.directive('limit-number', {
  inserted: (el, binding) => {
    let oldValue = el?.value

    const eventListener = (event) => {
      const inputValue = event.target.value

      const min = binding?.value?.min
      const max = binding?.value?.max

      const validValue = inputValue >= min && inputValue <= max

      if (validValue) {
        oldValue = inputValue
      }

      el.value = oldValue
    }

    el?.addEventListener('input', eventListener)
  },
})

Vue.directive('parse-number', {
  inserted: (el, binding) => {
    const value = el.value || ''
    const formattedValue = parseFloat(value.toString().replace(/,/g, ''))

    const validNumber =
      typeof formattedValue === 'number' && !isNaN(formattedValue)

    validNumber && (el.value = formattedValue)
  },
})
