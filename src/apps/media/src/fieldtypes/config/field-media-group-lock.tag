<field-media-group-lock>
    <label class="group-lock">
        <span>Lock to folder</span>
        <z-select options="{groups}" selection="{selection}" handler="{handler}"></z-select>
    </label>

    <script type="es6">
        this.groups = [{
            html: 'Loading',
            value: null
        }]

        this.selection = this.groups[0]

        this.on('mount', () => {
            this.fetchGroups()
        })

        this.handler = (evt) => {
            // Dirty dirty hack to get our event to
            // align with the callbacks expectation
            let psuedoEvt = {
                target: {
                    get: (key) => psuedoEvt.target[key]
                }
            }

            psuedoEvt.target.name = 'datatype_options[group]'
            psuedoEvt.target.value = evt.currentTarget.dataset.value

            this.opts.handler(psuedoEvt)
        }

        this.fetchGroups = () => {
            request(`${CONFIG.SERVICE_MEDIA_MANAGER}/site/${USER.account}/bins`)
            .then((binsRes) => {
                Promise.all(binsRes.data.map(bin => {
                    return request(`${CONFIG.SERVICE_MEDIA_MANAGER}/bin/${bin.id}/groups`)
                }))
                .then((groupsRes) => {
                    let bins = binsRes.data
                    let folders = groupsRes.reduce((prev, curr) => {
                        return prev.concat(curr.data)
                    }, [])
                    let groups = [...bins, ...folders].map(item => {
                        return {
                            html: item.name,
                            value: item.id
                        }
                    })
                    let selection = groups.find(group => group.value === opts.group_id)

                    this.update({groups, selection})
                })
            })
        }
    </script>
    <style media="scoped">
        #mountMediaGroupLock {
            clear: both;
        }
        :scope .group-lock {
            display: block;
            margin: 5px 0 15px;
        }
    </style>
</field-media-group-lock>
