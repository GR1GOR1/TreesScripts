class widget {
	static defaultTag = 'div'
	static lastDialog = null;
	static dialogHeight = {}
	static widgetStore = {}
	static globalState = []


	static* childToHTMLElement(child) {
		function convertor(element){
			if (element===false || element===undefined)
				return false;
			if (element instanceof HTMLElement) {
				return element
			}

			if (element && typeof element == 'object' && 'element' in element){
				const tag = element.element
				delete element.element
				return convertor(widget.createElement(tag, element))
			} else 
			if (WidgetState.canBind(element)){
				const temp_child = document.createElement(widget.defaultTag)
				element.link(temp_child, 'child')
				return temp_child
			} else
			if (typeof element == 'function'){
				return convertor(element())
			} else {
				const temp_child = document.createElement(widget.defaultTag)
				temp_child.innerHTML = element
				return temp_child
			}
		}

		if (Array.isArray(child)){
			for(const _child of child){
				const cheldGenerator = widget.childToHTMLElement(_child)
				for(const __child of cheldGenerator){
					yield convertor(__child)
				}
			}
		} else {
			yield convertor(child)
		}

	}


	static createElement(element, props = false, state = false) {

		// Оброботка state
		if (typeof props == 'function'){
			props = props(WidgetState.use(state?state:{}))
		}

		const true_elements = [
			"area", "base", "br", 
			"col", "embed", "hr", 
			"img", "input", "link", 
			"menuitem", "meta", "param", 
			"source", "track", "wbr"
		]

		function isEmpty(obj) { 
			for (var x in obj) { return false; }
			return true;
		}

		// Оброботка props
		if (props 
			&& true_elements.indexOf(element)==-1 
			&& !isEmpty(props)
			&& (
			Array.isArray(props)
			|typeof props == 'string'
			|(typeof props == 'function' && state==false)
			|(typeof props == 'object' && 
				((
					!('child' in props) && 
					!('innerHTML' in props) && 
					!('value' in props) && 
					!(element in widget.widgetStore)
				) | (
					('element' in props)
				))
			) 
			|props instanceof HTMLElement
		)) {
			props = {child: props}
		}


		// Оброботка element
		if (element in widget.widgetStore){
			return widget.widgetStore[element](props, state)
		} else 
		if (typeof element == 'string'){


			// быстрые классы
			if (element.indexOf("__")!=-1){
				const classes = element.split('__')
				element = classes[0]
				let classList = ''
				classes[1]
					.replaceAll('$$', '-')
					.replaceAll('$', ' ')
					.split('')
					.map(char => {
					if (char!=char.toLowerCase(char)){
						classList += '-' + char.toLowerCase(char)
					} else {
						classList += char
					}
				})

				if (!props)
					props = {}

				props['className'] = classList
			}




			element = document.createElement(element)
		}

		let oncreate = false;

		// Применение свойств
		if (props) 
		for (let i of Object.keys(props)) { 
			let prop = props[i];

			if (prop && typeof prop == 'object' && 'element' in prop && prop.element == 'function'){
				eval(`prop = function(){${prop?.function}}`)
			}


			switch (i) {
				case 'oncreate':
					oncreate = prop.bind(element)
				break;
				case 'style':
					if (typeof prop == 'string')
						element.style = prop
					else
						for (let j of Object.keys(prop)) {
							const styleElement = prop[j]
							if (Array.isArray(styleElement)){
								element.style[j] = styleElement[0]
								setTimeout(() => 
									element.style[j] = styleElement[1]
								, 10)
							} else {
								if ((typeof styleElement == 'object' && 'link' in styleElement) | typeof styleElement == 'function') {
									WidgetState.inspector(styleElement, [element, i, j])
								} else {
									element.style[j] = styleElement
								}
							}
						}
				break;
				case 'child':
					while (element.firstChild)
						element.removeChild(element.firstChild);


					const cheldGenerator = widget.childToHTMLElement(prop)
					for(const _child of cheldGenerator){
						if (_child)
							element.appendChild(_child)
					}
					
					
				break;
				default:
					if (WidgetState.canBind(prop) || (typeof value == 'function' && i.substr(0, 2) != 'on')) {
						WidgetState.inspector(prop, [element, i])
					} else {
						element[i] = prop
					}
				break;
			}
		} 
		if (oncreate && typeof oncreate == 'function') oncreate();


		props
		state

		return element
	}


	static body(element, state) {
		widget.renderTo('body', element, state)
	}


	static renderTo(querySelector, element, state = false) {
		const toElement = window.document.querySelector(querySelector);
		if (toElement){
			toElement.appendChild(c.div(element, state))
		} else {
			window.addEventListener('load', () => {
				widget.renderTo(querySelector, element, state)
			});
		}
	}


	static app(element, state = false) {
		const el = c.div(element, state)
		c.renderTo('#app', el)
	}


	static getElementConstructor(cprop = {}) {
		const getProxy = (st = cprop) => new Proxy(st, {
			set(element, prop, value){
				element[prop] = value;
				return getProxy(element)
			},
			get(element, prop){
				if (prop=='element')
					return c.div(element)
				else
					return (val) => {
						element[prop] = val
						return getProxy(element)
					}
			}
		})

		return getProxy()
	}


	static widgetRegister(name, _widget = () => false) {
		if (name in widget.widgetStore){
			throw 'Компонент ' + name + ' - уже зарегистрирован!';
			return false;
		}
		widget.widgetStore[name] = (prps) => {
			return _widget(prps)
		}
		return true;
	}
}

Array.prototype.c = function(cprop = {}) {
	return widget.getElementConstructor(cprop)
}

const w = (element, params = false, state = false) => widget.createElement(element, params, state);
const c = new Proxy({}, {
	get:(_, tag) => {
		if (typeof widget[tag] === 'function'){
			return widget[tag]
		} else {
			return function (props = false, state = false) {
				return widget.createElement(tag, props, state)
			}
		}
	},
	set:(_, tag, props) => widget.widgetRegister(tag, props)
})

class WidgetState {
    static use(obj){

		const setParents = []

		if (obj==null | obj==false)
			obj = {}

		Object.keys(obj).map(i => {
			if (obj && typeof obj[i]=='object' && i.substr(0,1)!='_'){
				
				if (Array.isArray(obj[i])){
					const array = {}
					obj[i].map((val, key) => {
						array[''+key] = val
					})
					obj[i] = array
				}
				
				if (obj[i]){
					obj[i] = WidgetState.use(obj[i])
					setParents.push(i)
				}

			}
		})

		// if (obj && typeof obj=='object')
		obj['___parent'] = false;

        const state = new Proxy(obj, {
            get(object, prop){
                if (WidgetState[prop]){
                    return function(){
						const result = WidgetState[prop].apply(this, [object, ...arguments])
						if (typeof result == 'function'){
							return result.apply(this, arguments)
						} else {
							return result
						}
					}
                } else {
                    return object[prop]
                }
            },
            set(object, prop, value){
                object[prop] = value
                WidgetState.updateAll(object, prop)
            }
        })

		setParents.map(i => {
			state[i].set('___parent', state)
		})

        widget.globalState.push(state)
        return state;
    }

	static set(self, key, value){
		self[key] = value
		WidgetState.updateAll(self)
	}

	static push(self, prop){
		const count = WidgetState.keys(self).length 
		self['' + count] = prop

		WidgetState.updateAll(this)
	}

	static filterSystemVars(array){
		const exception = ['___updates', '___parent'] 
		return array.filter(itm => {
			return exception.indexOf(itm)==-1
		})
	}

	static keys(self){
		return WidgetState.filterSystemVars(Object.keys(self))
	}

	static values(self){
		return WidgetState.keys(self).map(itm => self[itm])
	}

	static map(self, func){
		return WidgetState.values(self).map(func)
	}

	static length(self){
		return WidgetState.keys(self).length
	}

	static canBind(value){
		const res = (typeof value == 'object' && value!=null && 'link' in value)
		return res
	}

    static watch(self){
        return (props) => {
            let updateFunction = _vars => _vars;
            if (typeof props == 'function'){
                // try {
                    updateFunction = props
                    const [_, fprops] = /\(?(.{0,}?)[\)|=]/m.exec(props.toString())
                    props = fprops.split(',').map(i => i.trim())
                // } catch (e) {
                    // props = Object.keys(self.props)
                // }
            } else if (typeof props == 'string'){
                props = props.split(',').map(i => i.trim())
            }

            return {
                link(){
                    if (!('___updates' in self)) self['___updates'] = {}
                    
                    props.map(prop => {
                        if (!(prop in self['___updates'])) self['___updates'][prop] = []
                        self['___updates'][prop].push({
                            path: Array.isArray(arguments[0])?arguments[0]:arguments,
                            update: updateFunction,
                            props: props
                        })
                        WidgetState.updateAll(self, prop)
                    })
                }
            }
        }
    }

	static model(self){
		return (prop) => {
			// console.log(this)
			// console.log(self)
			// console.log(prop)
			return {
				link(){
					console.log('arguments', arguments)

					// console.log('---------');
					WidgetState.elementPropsArraySetValue(arguments[0], () => {
						this[prop] = arguments[0][0][prop]

						console.log('state', this)
					})
				}
			}
		}
	}

	/**
	 * Установить значение по пути до элемента
	 * 
	 * @param {array} elementProps 
	 * @param {*} value 
	 */
	static elementPropsArraySetValue(elementProps, value){
		let element = elementProps.shift();
		let elementPropperty = 'child'
		while (elementProps.length!=0){
			elementPropperty = elementProps.shift();
			if (elementProps.length==0)
				break
			
			element = element[elementPropperty]
		}

		if (elementPropperty.substr(0,1)=='on' && typeof value == 'function'){
			el.addEventListener(elementPropperty, value, false);
		} else {
			element[elementPropperty] = value
		}
	}

    static updateAll(self, _prop = false) {
		let props = [] 
		if (_prop==false)
			props = WidgetState.keys(self)
		else 
			props = [_prop]
		
		props.map(prop => {

			if ('___updates' in self && prop in self['___updates']){
				self['___updates'][prop].map(updateList => {
					const props = updateList.props
					const update = updateList.update
					const mp = [...updateList.path]

					let element = mp.shift();
					let elementPropperty = 'child'
					while (mp.length!=0){
						elementPropperty = mp.shift();
						if (mp.length==0)
						break
						
						element = element[elementPropperty]
					}

					const properties = []
					props.map(i => {
						properties.push(self[i])
					})
					
					const value = update.apply(this, properties);
					w(element, {
						[elementPropperty]: value
					})
				})
			}
		})


		if (self.___parent) 
			WidgetState.updateAll(self.___parent)
    }

    static props(self) {
		const props = {}
		Object.entries(self).map(([key, value]) => {
			if (['___updates', '___parent'].indexOf(key)==-1){
				props[key] = value;
			}
		})
        return props;
    }

	static import(elements) {
		console.log('import', elements);
	}

    static inspector(func, to) {
		if ('link' in func)
			func.link(to)
		else
			console.log('Find State');
	}
}


function showDialog({title, message, buttons, data, state = false, style, methods, form_request, nav}) {
	return new Promise(function(resolve, reject) {
		
		if (state){
			if (typeof state == 'function')
				data = state(data)
			else
				data = state
			state = true
		}

		let navPath = ''
		let navigator = null
		if (nav) {
			navigator = createElement('div', {
				style: {
					borderRight: '1px solid #ccc',
					minWidth: '150px'
				}
			})


			function renderMenu(elements){
				const ul = createElement('ul', {
					style: {
						margin: 0,
						padding: 0
					}
				})


				let keys = []
				if (Array.isArray(elements)){
					keys = elements.map(x => x['title'])
				} else {
					
				}


				for(const i of Object.keys(elements)){
					// console.log('>>>', i);
					const li = createElement('ul', {
						innerHTML: i,
						style: {
							margin: 0,
							padding: '2px 5px',
							fontSize: '14px',
							cursor: 'pointer',
							transition: 'all .3s'
						}, 
						hover: {
							background: '#ccc',
							color: '#fff'
						}
					})
					ul.appendChild(li)
				}
				return ul
			}
			navigator.appendChild(renderMenu(nav))
		}

		// console.log(navigator)


		const main_buttons = buttons;
		const main_message = message;
		const main_data = data;
		function serializator(_frm) {
			let array = Array.from(new FormData(_frm));
			// console.log('array', array);
			let result = {};
			for (let i in array) {


				let name = array[i][0];
				let value = array[i][1];

				if (name && name.indexOf('[') != -1) {
					let exp = name.split('[');
					let new_name = exp[0];
					let id = exp[1].replace(']', '');

					if (new_name in result) {
						result[new_name] = Object.assign(result[new_name], { [id]: value });
					} else {
						result = Object.assign(result, { [new_name]: { [id]: value } });
					}
				} else {
					result = Object.assign(result, { [name]: value });
				}
			}
			return result;
		}



		const _modelDi = document.createElement("div")
		let mouseOnCloseWrapper = false
		const remove_black = () => {
			if (widget.lastDialog) {
				try {
					widget.lastDialog.parentNode.removeChild(widget.lastDialog);
				} catch (err) { 
					console.log('showDialog', err) 
				}
				widget.lastDialog = null
				document.body.style.overflow = 'auto'
				if (methods && 'onclose' in methods && typeof methods['onclose'] == 'function')
					methods['onclose']();
			}
		}
		remove_black()
		document.body.style.overflow = 'hidden'
		widget.lastDialog = _modelDi
		const on_mousedown = function (e) {
			if (e.target == this && window.outerWidth - e.clientX > 50)
				mouseOnCloseWrapper = true
		}
		const on_mouseup = function () {
			if (mouseOnCloseWrapper) {
				document.body.style.overflow = 'auto'
				remove_black()
			}
		}

		_modelDi.classList.add('black_h12nbsx9dk23m32ui4948382')
		_modelDi.onmousedown = on_mousedown
		_modelDi.onmouseup = on_mouseup


		const _form = document.createElement("form")
		_form.classList = ['_form_h12nbsx9dk23m32ui4948382']
		if (style) {
			if (style.padding)
				_form.style.padding = style.padding

			if (style.width)
				// _form.style.width = style.width + 'px !important'
				_form.setAttribute('style', `width: ${style.width}px !important`);
		}


		const fieldset = document.createElement("fieldset")


	
		_form.appendChild(fieldset)


		if (form_request) {
			if ('method' in form_request)
				_form.method = form_request['method'];

			if ('action' in form_request)
				_form.action = form_request['action'];

			if ('target' in form_request)
				_form.target = form_request['target'];
		}



		const _formRight = document.createElement("form")
		_formRight.onsubmit = (e) => e.preventDefault()
		_formRight.style.display = 'none'
		_formRight.classList = ['_formRight_h12nbsx9dk23m32ui4948382']


		const close_panel = getButtons({ '✖': (e) => { mouseOnCloseWrapper = true; on_mouseup() } }, title, false)
		close_panel.classList = ['close_panel_h12nbsx9dk23m32ui4948382']


		function xright({ message, buttons, width, data }) {
			width = parseInt(width)
			const htmldata = document.createElement("div")
			if (width) {
				window.style.maxWidth = (650 + width) + 'px'
				_formRight.style.width = width + 'px'
				htmldata.style.width = width - 30 + 'px'
			} else
				window.style.maxWidth = '850px'

			_formRight.style.height = _form.offsetHeight + 'px'
			_formRight.innerHTML = '';
			_formRight.appendChild(htmldata)
			messageToFieldset(htmldata, message, data)

			_formRight.style.display = 'block'
			// _formRight.innerHTML = mess
			fieldset.disabled = true;

			const closeRight = () => {
				window.style.maxWidth = '650px'
				_formRight.style.display = 'none'
				bottomButtons.innerHTML = '';
				bottomButtons.appendChild(getButtons(main_buttons))
				fieldset.disabled = false;
			}
			bottomButtons.innerHTML = '';

			const apply = () => {
				const data2 = serializator(_formRight)

				data = Object.assign(serializator(_form), data2)
				messageToFieldset(fieldset, main_message, data)
				return data2
			}

			if (buttons) {
				const btns2 = {}
				for (let i of Object.keys(buttons)) {
					btns2[i] = () => {
						if (!_formRight.reportValidity()) return false;

						// console.log('_formRight>>', _bind);

						let right_bind = _bind;
						right_bind.close = closeRight

						let __f = buttons[i]
						__f = __f.bind(right_bind)// (apply())
						closeRight()
						__f(apply())
					}
				}
				bottomButtons.appendChild(getButtons(btns2))
			} else
				bottomButtons.appendChild(getButtons({
					'Сохранить': () => {
						if (!_formRight.reportValidity()) return false;
						closeRight()
						apply()
					}
				})
				)
		}

		var _bind = {
			resolve,
			reject,
			createElement: widget,
			widget,
			button: {

			},
			data: main_data,
			close: () => {
				remove_black()
			},
			reopen(nn_data){
				remove_black();
				showDialog({ title, message, buttons, data: nn_data, style, methods, form_request });
			},
			serializeForm: () => {
				return serializator(_form)
			},
			form: () => {
				const formData = Object.assign(data, serializator(_form));
				const descript = {}

				for (const i of Object.keys(formData)) {
					Object.defineProperty(descript, i, {
						get: () => Object.assign(data, serializator(_form))[i],
						set: (x) => {
							// console.log(main_data)

							messageToFieldset(fieldset, main_message, Object.assign(Object.assign(main_data, serializator(_form)), { [i]: x }))
						}
					});
				}

				return descript;
			},
			methods,
			reRender: (data) => {
				messageToFieldset(fieldset, message, data)
			}
		}


		_bind['right'] = xright.bind(_bind)

		function insertData(html, data) {
			if (data) {
				if (typeof html === 'string' && html.indexOf("$") != -1)
					for (let i of Object.keys(data)) {
						html = html.split('$' + i).join(data[i])
					}
			}
			return html;
		}

		function appy_methods() {
			if (methods)
				setTimeout(() => {
					for (let method of Object.keys(methods)) {
						const qs = `.${window.classList.toString().replace(' ', ' .')} button[onclick*="${method}"]`;

						const buttons_list = document.querySelectorAll(qs);
						for (let i = 0; i < buttons_list.length; i++) {

							_bind['button'] = {
								loading() {
									buttons_list[i].classList.toggle('load');
								},
								element: buttons_list[i]
							}

							// _bind['button'] = ;
							const f = methods[method].bind(_bind)

							const mtd = function (e) {
								e.preventDefault();
								let cdata = buttons_list[i].getAttribute('onclick').substr(method.length);
								eval('f' + cdata)
							}.bind(_bind);

							buttons_list[i].onclick = mtd;
						}
					}
				}, 100);
		}

		function toHtml(to, data) {
			to.innerHTML = data
			appy_methods()
		}


		function messageToFieldset(to, message, data) {
			// console.log('messageToFieldset',  to, message, data);
			if (data instanceof Promise) {
				// console.log(message, 'data Promise', data);
				to.innerHTML = '<div class="load">Подождите...</div>';
				data.then(itm => {
					if ('clone' in itm)
						return itm.clone().json().catch(() => itm.text())
					else
						return itm
				}).then(itm => {
					_bind['fetchData'] = itm;
					messageToFieldset(to, message, itm)
				});
				return false;
			} else if (typeof data == 'function') {
				// console.log(message, 'data function', data);
				_bind['functionData'] = data;
				messageToFieldset(to, message, data())
				return false;
			} else if (state != false && data?.constructor?.name!="WidgetState"){
				data = WidgetState.use(data)
				_bind['data'] = data;
				messageToFieldset(to, message, data)
				return false;
			}

			if (message instanceof Promise) {
				// console.log('message Promise', message, data);
				to.innerHTML = '<div class="load">Подождите...</div>';
				message.then(itm => {
					if ('clone' in itm)
						return itm.clone().json().catch(() => itm.text())
					else
						return itm
				}).then(itm => {
					_bind['fetchMessage'] = itm;
					messageToFieldset(to, itm, data)
				});
				return false;
			} else if (typeof message == 'function') {
				// console.log('message function', message, data);
				message = message.bind(_bind)
				_bind['functionMessage'] = message;
				messageToFieldset(to, message(data), data)
				return false;
			} else if (message instanceof HTMLElement) {
				// console.log('message HTMLElement', message, data);
				to.innerHTML = '';
				to.appendChild(message)
			} else {
				// console.log('message else', message, data);
				toHtml(to, insertData(message, data))
			}
		}

		if (main_message)
			messageToFieldset(fieldset, main_message, main_data)

		const window = document.createElement("div")
		window.classList.add('window_h12nbsx9dk23m32ui4948382')
		window.appendChild(close_panel)
		if (style) {
			if (style.color) window.style.color = style.color
			if (style.background) window.style.background = style.background
			if (style.width) window.style.maxWidth = `${style.width}px`
		}



		const form_panel = document.createElement("div")
		form_panel.classList = ['form_panel_h12nbsx9dk23m32ui4948382']

		if (navigator){
			// _form.style.display = 'flex'
			form_panel.appendChild(navigator)
			// fieldset.style.flex = '1'
		}

		form_panel.appendChild(_form)
		form_panel.appendChild(_formRight)

		window.appendChild(form_panel)


		const bottomButtons = document.createElement("div")
		if (buttons)
			bottomButtons.appendChild(getButtons(main_buttons))

		window.appendChild(bottomButtons)
		_modelDi.appendChild(window)

		_modelDi.onscroll = function (e) {
			widget.dialogHeight[title] = _modelDi.scrollTop
		}





		function getButtons(buttons, title, report = true) {
			let result = document.createElement("div")
			result.classList.add('buttons_panel_h12nbsx9dk23m32ui4948382')
			result.appendChild(document.createElement("div"))


			if (title) {
				const titlex = document.createElement("div")
				titlex.innerText = title
				titlex.classList = ['dialogTitle_h12nbsx9dk23m32ui4948382']

				result.appendChild(titlex)
			} else {
				result.style.justifyContent = "flex-end"
			}


			if (typeof buttons == 'object') {
				for (let title of Object.keys(buttons)) {
					let btn = document.createElement('button')
					btn.innerHTML = title

					btn.onclick = () => {
						if (report)
							if (!_form.reportValidity()) return false;

						_bind['button'] = {
							loading(f = true) {
								if (f)
									btn.classList.add('load');
								else
									btn.classList.remove('load');
							},
							element: btn
						}
						// _bind['button'] = ;
						const f = buttons[title].bind(_bind)
						f(serializator(_form))
					}

					result.appendChild(btn)
				}
			} else {

			}
			return result
		}





		document.body.appendChild(_modelDi)

		if (title in widget.dialogHeight)
			_modelDi.scrollTop = widget.dialogHeight[title]

	})
}