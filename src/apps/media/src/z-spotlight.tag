<z-spotlight>
    <section id="z-spotlight">
        <z-modal modal="{opts}">
            <z-search-field
                loading="{parent.loading}"
                handler="{parent.search}"
                placeholder="Site Content Search">
            </z-search-field>
            <ul id="results">
                <li if="{parent.term && !parent.results.length && !parent.loading}" id="noResults">
                    No Results
                </li>
                <li each="{result, i in parent.results}" class="result result{i}">
                    <a
                        if="{result.type === 'dataset' || result.type === 'pageset'}"
                        class="spotlight-result {selected: result.selected}"
                        href="#!/content/{result.zuid}/new"
                        onclick="{parent.parent.handleClickSelect}">
                        <span class="spotlight-icon">
                            <i class="result-icon icon-plus"></i>
                        </span>
                        <span class="spotlight-content">
                            <span class="spotlight-title">{result.seo_link_title} </span>
                        </span>
                        <span class="spotlight-chevron">
                            <i class="icon-chevron-right"></i>
                        </span>
                    </a>
                    <a
                        if="{result.type !== 'dataset' && result.type !== 'pageset'}"
                        class="spotlight-result {selected: result.selected}"
                        href="#!/content/{result.set_zuid}/{result.zuid}"
                        onclick="{parent.parent.handleClickSelect}">

                        <span class="spotlight-icon">
                            <i if="{result.type === '301redirect'}" class="result-icon icon-link"></i>
                            <i if="{result.type === 'item'}" class="result-icon icon-edit"></i>
                        </span>
                        <span class="spotlight-content">
                            <span class="spotlight-title">{result.seo_link_title} </span>
                            <em if="{result.type === '301redirect'}" class="spotlight-path">{result.path_part}</em>
                            <em if="{result.type === 'item'}" class="spotlight-path">
                                <strong if="{result.lang_code}">/{result.lang_code}</strong>/{result.path_part}/
                            </em>
                            <small if="{result.type === 'item'}" class="spotlight-desc">{result.seo_meta_description}</small>
                        </span>
                        <span class="spotlight-chevron">
                            <i class="icon-chevron-right"></i>
                        </span>
                    </a>
                </li>
            </ul>
        </z-modal>
    </section>
    <script type="es6">
    this.loading = false
    this.results = []
    this.term = ''

    this.search = (evt) => {
        const term = evt.target.value.trim()
        if (term) {
            this.update({
                loading: true,
                results: [],
                term: term
            })
            request(`/ajax/spotlight.ajax.php?term=${term}`)
            .then((results) => {
                const keys = Object.keys(results)
                const arr = keys.map(key => results[key])

                if (zesty.addons.i18n.settings.activated) {
                    arr.forEach((el) => {
                        if (el.lang_id && basil.view_object.langs[el.lang_id]) {
                            el.lang_code = basil.view_object.langs[el.lang_id].code.toLowerCase()
                        }
                    })
                }

                this.update({
                    loading: false,
                    results: arr
                })
            })
            .catch((err) => {
                console.log('error', err)
                this.update({
                    loading: false
                })
            })
        } else {
            this.update({results: [], term: ''})
        }
    }

    this.handleArrow = (evt) => {
        const up = (evt.keyCode === 38)
        const down = (evt.keyCode === 40)

        if (up || down) {
            const currentSelected = this.results.find(result => result.selected)
            const indexOfSelected = this.results.indexOf(currentSelected)
            const nextSelected = up ? indexOfSelected - 1 : indexOfSelected + 1
            if (this.results[indexOfSelected] && this.results[nextSelected]) {
                this.results[indexOfSelected].selected = false
            }
            if (this.results[nextSelected]) {
                this.results[nextSelected].selected = true

                const container = this.root.querySelector('#results')
                const element = this.root.querySelector('.result'+nextSelected)

                if (container && element) {
                    container.scrollTop = (element.offsetTop - 80)
                }
            }

            this.update()
        }
    }

    this.handleClickSelect = (evt) => {
        this.tags['z-modal'].close()
        window.location = evt.currentTarget.href
        return false
    }

    this.handleArrowSelect = (evt) => {
        const currentSelected = this.results.find(result => result.selected)
        if (evt.keyCode === 13 && currentSelected && currentSelected.zuid) {
            this.tags['z-modal'].close()
            if(currentSelected.zuid.slice(0,2) === '17'){
                window.location =  `#!/content/link/${currentSelected.zuid}`
            } else {
                window.location = currentSelected.set_zuid ? `#!/content/${currentSelected.set_zuid}/${currentSelected.zuid}` : `#!/content/${currentSelected.zuid}`
            }
        }
    }

    this.on('mount', () => {
        this.root.querySelector('input').focus()
        this.root.addEventListener('keydown', this.handleArrow)
        this.root.addEventListener('keydown', this.handleArrowSelect)
    })
    this.on('unmount', () => {
        this.root.removeEventListener('keydown', this.handleArrow)
        this.root.removeEventListener('keydown', this.handleArrowSelect)
    })
    </script>
    <style>
    #z-spotlight #modal {
        position: absolute;
        top: 27vh;
        max-width: 80rem;
        height: initial;
        max-height: 56vh;
        background: transparent;
        border: 0;
    }
    #z-spotlight .loading {
        display: flex;
        align-content: center;
        justify-content: center;
    }

    #z-spotlight z-search-field button {
        height: 5rem;
        border-bottom: 0;
        margin: 0;
        width: 4rem;
        border-radius: 0;
    }
    #z-spotlight z-search-field input {
        font-size: 2.3rem;
        border-bottom: 0;
        border-radius: 0;
    }

    #z-spotlight #results {
        background: transparent;
        overflow-y: scroll;
        max-height: 50rem;
    }
    #z-spotlight #results #noResults {
        background: #C7D4EA;
        font-size: 2rem;
        line-height: 8rem;
        text-align: center;
        font-weight: 800;
    }
    #z-spotlight #results .spotlight-result {
        display: flex;
        padding: 1rem 1.5rem 1rem 0rem;
        font-size: 1.8rem;
        justify-content: center;
        background: #C7D4EA;
        border-bottom: 1px #A7AFBF solid;
        text-decoration: none;
        align-items: center;
        color: #1b202c;
    }
    #z-spotlight #results .spotlight-result:hover,
    #z-spotlight #results .spotlight-result:active,
    #z-spotlight #results .spotlight-result:focus,
    #z-spotlight #results .spotlight-result.selected {
        background-color: #FFF;
        color: #1b202c;
    }
    #z-spotlight #results .spotlight-result .spotlight-icon {
        color: #5B667D;
        padding: 1rem;
        flex-basis: 2rem;
    }
    #z-spotlight #results .spotlight-result:hover .spotlight-icon,
    #z-spotlight #results .spotlight-result:active .spotlight-icon,
    #z-spotlight #results .spotlight-result:focus .spotlight-icon {
        color: #F17829;
    }

    #z-spotlight #results .spotlight-result .spotlight-content {
        flex: 2;
    }
    #z-spotlight #results .spotlight-result .spotlight-content .spotlight-title {
        font-size: 2rem;
        line-height: 130%;
    }
    #z-spotlight #results .spotlight-result .spotlight-content .spotlight-path {
        color: #A7AFBF;
        font-size: 1.2rem;
        display: block;
        margin: 3px 0px 6px 0px;
        line-height: 120%;
    }
    #z-spotlight #results .spotlight-result .spotlight-content .spotlight-desc {
        font-size: 1.2rem;
        color: #697A91;
        text-overflow: ellipsis;
        display: block;
        line-height: 120%;
    }
    #z-spotlight #results .spotlight-result .spotlight-chevron {
        visibility: hidden;
    }
    #z-spotlight #results .spotlight-result:hover .spotlight-chevron,
    #z-spotlight #results .spotlight-result:active .spotlight-chevron,
    #z-spotlight #results .spotlight-result:focus .spotlight-chevron {
        visibility: visible;
    }
    #results::-webkit-scrollbar {
        background-color: #C7D4EA;
        width: 6px;
        }
    #results::-webkit-scrollbar-button {
        background-color: #C7D4EA;
        display: none;
        }
    #results::-webkit-scrollbar-track {
        background-color: #C7D4EA;
    }
    #results::-webkit-scrollbar-track-piece {
        background-color: #C7D4EA;
    }
    #results::-webkit-scrollbar-thumb {
        background-color: #8994aa;
    }
    #results::-webkit-scrollbar-corner {
        background-color: #C7D4EA;
    }
    </style>
</z-spotlight>
