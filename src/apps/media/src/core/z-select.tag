<z-select>
    <div class="selector" onclick="{toggle}">
        <span class="selection">
            <span class="content">
                <raw html="{(selection || opts.selection || opts.options[0]).html}"></raw>
            </span>
            <i class="icon icon-chevron-right chevron"></i>
            <i class="icon icon-chevron-down chevron"></i>
        </span>
        <ul class="selections">
            <z-search-field
                if="{searchOn}"
                class="filter"
                onclick="{noop}"
                handler="{filter}"
                placeholder="Enter a term to filter this list">
            </z-search-field>
            <div class="options">
                <li if="{opts.default}"
                    onclick="{setSelection}"
                    data-value="false">
                    <raw html="{opts.default}"></raw>
                </li>
                <li each="{opts.options}"
                    onclick="{parent.setSelection}"
                    class="{class}"
                    data-value="{value}">
                    <raw html="{html}"></raw>
                </li>
            </div>
        </ul>
    </div>

    <script type="es6">
        // Options are sometimes given to us from legacy
        // code so we have to keep internal state for filtering
        var _options = [...opts.options]

        this.searchOn = opts.search || _options.length >= 50

        this.noop = (evt) => {
            evt.stopPropagation()
            evt.preventDefault()
        }

        this.filter = (evt) => {
            let value = evt.target.value.trim().toLowerCase()

            if (value) {
                opts.options = _options.filter((opt) => {
                    return opt.html.toLowerCase().indexOf(value) !== -1
                })
            } else {
                opts.options = _options
            }

            this.update()
        }
        this.setSelection = (evt) => {
            if (opts.lockWidth) {
                this.root.style.maxWidth = this.root.offsetWidth + 'px'
            }

            // always trigger handlers
            // individual option handler
            if (evt.item && evt.item.handler) {
                evt.item.handler(evt)
            }
            // z-select instance handler
            if (opts.handler) {
                opts.handler(evt)
            }

            this.update({
                selection: opts.options.find(opt => {
                    return opt.value === evt.currentTarget.dataset.value
                })
            })
        }
        this.toggle = (evt) => {
            evt.preventUpdate = true
            evt.currentTarget.classList.toggle('show')

            const body = document.querySelector('#bodySection')
            const content = document.querySelector('#contentView')

            if (body && content) {
                const filter = this.root.querySelector('.filter .z-search-field')
                const selections = this.root.querySelector('.selections')
                const initialSelectionsHeight = selections.offsetHeight
                const scrollOffset = body.scrollTop
                const contentHeight = content.getHeight()
                const selectorPosition = this.root.getPosition()

                if (initialSelectionsHeight < contentHeight) {
                    if (initialSelectionsHeight + selectorPosition.y > contentHeight) {
                        // If we can adjust the dropdown height to fit in the
                        // available content space, subtracting the footer 50px height
                        let newHeight = (Math.floor(contentHeight - selectorPosition.y) - 50)
                        if (newHeight > 200 && newHeight < 600) {
                            // The options list controls the overflow scrolling
                            // so we have to adjust it's height
                            selections.querySelector('.options').style.height = newHeight+'px'
                        } else {
                            selections.style.top = '-'+initialSelectionsHeight+'px'
                        }
                    }
                }

                if (filter) {
                    filter.querySelector('input').focus()
                }
            }
        }
        this.onEsc = (e) => {
            if (27 == e.which) {
                this.root.querySelector('.selector').classList.remove('show')
            }
        }
        this.onClose = (e) => {
            const parent = e.target.closest('.selector')
            const instance = this.root.querySelector('.selector')

            // Close this select if the click occured
            // outside a z-select or this instance
            if (!parent || parent !== instance) {
                this.root.querySelector('.selector').classList.remove('show')
            }
        }

        this.on('mount', () => {
            document.addEventListener('click', this.onClose)
            document.addEventListener('keyup', this.onEsc)
        })

        this.on('unmount', () => {
            document.removeEventListener('click', this.onClose)
            document.removeEventListener('keyup', this.onEsc)
        })
    </script>

    <style>
    .selector {
        cursor: pointer;
        line-height: 3rem;
        flex: 1;
        position: relative;
    }
    .selector .chevron {
        background-color: #e3ebf9;
        color: #5B667D;
        line-height: inherit;
        border-right: 1px solid #9dabc5;
        <!--  font-size: 16px;  -->
        flex-basis: 32px;
        justify-content: center;
        align-items: center;
        display: flex;
    }
    .selector.show .icon-chevron-right {
        display: none;
    }
    .selector .icon-chevron-down {
        display: none;
    }
    .selector.show .icon-chevron-down {
        display: flex;
    }

    .selector .selection {
        align-items: center;
        background-color: #EFF5FF;
        color: #5B667D;
        border: solid 1px #9DABC5;
        display: flex;
        overflow: hidden;
        padding: 0;
        text-overflow: ellipsis;
        white-space: nowrap;
        border-radius: 4px;
        flex-direction: row-reverse;
    }
    .selector .selection:active,
    .selector .selection:hover,
    .selector .selection:focus {
        background-color: #FFF;
    }
    .selector .selection .content {
        flex: 1;
        padding: 0 1rem;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .selector .selection .content strong {
        font-weight: 900;
        <!--  font-size: 1.2rem;  -->
        margin-right: 1.2rem;
    }
    .selector .selections {
        display: none;
        box-shadow: 0px 4px 10px #616c80;
        background: #b5becc;
        border-top: 1px solid #9DABC5;
        border-radius: 0 4px 4px 4px;
        margin: -1px 0 0 1px;
        min-width: 100%;
        position: absolute;
        z-index: 20;
        /*max-height: 600px;
        overflow: hidden;*/
    }
    .selector .selections .options {
        height: inherit;
        overflow-y: scroll;
        max-height: 600px;
    }
    .selector.show .selection {
        border-radius: 4px 4px 0 0;
    }
    .selector.show .selections {
        display: block;
    }

    .selector .selections .filter button {
        line-height: 2rem;
        margin: 0;
    }
    .selector .selections hr {
        border: 0;
        width: 100%;
        margin: 0;
        border-top: 2px solid #C7D4EA;
    }

    .selector .selections li {
        color: #5d6476;
        cursor: pointer;
        border-bottom: 1px solid #a2aab6;
        line-height: 20px;
        padding: 1rem;
    }
    .selector .selections li.unselected {
        color: #6b7994;
        text-shadow: 1px 1px 0px #c9cdd6;
    }
    .selector .selections li:active,
    .selector .selections li:hover,
    .selector .selections li:focus,
    .selector .selections li:active strong,
    .selector .selections li:hover strong,
    .selector .selections li:focus strong {
        background-color: #6C7994;
        color: #FFF;
    }
    .selector .selections li strong {
        color: #363d4d;
        display: block;
        font-weight: 900;
    }
    .selector .selections li a .name {
        flex: 1;
    }
    </style>
</z-select>
