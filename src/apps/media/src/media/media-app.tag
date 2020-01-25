<media-app>
    <div id="media-manager">
        <media-app-controls
            bin_id="{bin_id}"
            storage_name="{storage_name}"
            storage_driver="{storage_driver}"
            group="{currentGroup}">
        </media-app-controls>
        <media-selected
            files="{files}">
        </media-selected>
        <div id="media">
            <media-sidebar
                if="{!opts.lock}"
                bins="{bins}"
                groups="{groups}">
            </media-sidebar>
            <media-group
                bin_id="{bin_id}"
                storage_name="{storage_name}"
                storage_driver="{storage_driver}"
                group="{currentGroup}"
                loading="{loading}">
            </media-group>
        </div>
        <yield/>
    </div>
    <script type="es6">
        this.loading = true

        this.files = []
        this.groups = []
        this.bins = []

        this.storage_driver = ''
        this.storage_name = ''
        this.bin_id = ''

        this.currentGroup = {}

        this.on('unmount', () => {
            zesty.off('media:file:save', this.saveFile)
            zesty.off('media:file:upload', this.uploadFile)
            zesty.off('media:file:delete', this.deleteFile)
            zesty.off('media:file:preview', this.previewFile)
            zesty.off('media:file:select', this.selectFile)
            zesty.off('media:file:unselect', this.unselectFile)
            zesty.off('media:group:save', this.saveGroup)
            zesty.off('media:group:load', this.loadGroup)
            zesty.off('media:group:delete', this.deleteGroup)
            zesty.off('media:group:create', this.createGroup)
            zesty.off('media:bin:save', this.saveBin)
            zesty.off('media:bin:load', this.loadBin)
            zesty.off('media:search', this.search)
        })

        this.on('mount', () => {
            zesty.on('media:file:save', this.saveFile)
            zesty.on('media:file:upload', this.uploadFile)
            zesty.on('media:file:delete', this.deleteFile)
            zesty.on('media:file:preview', this.previewFile)
            zesty.on('media:file:select', this.selectFile)
            zesty.on('media:file:unselect', this.unselectFile)
            zesty.on('media:group:save', this.saveGroup)
            zesty.on('media:group:load', this.loadGroup)
            zesty.on('media:group:delete', this.deleteGroup)
            zesty.on('media:group:create', this.createGroup)
            zesty.on('media:bin:save', this.saveBin)
            zesty.on('media:bin:load', this.loadBin)
            zesty.on('media:search', this.search)

            let siteBins = this.fetchAllSiteBins()
            let ecoBins = this.fetchAllEcoBins()

            Promise.all([siteBins, ecoBins])
            .then(results => {
                let bins = [...results[0], ...results[1]]

                if (bins.length) {
                    let collapsedBinIds = localStorage.getItem('media:bins:collapsed')
                    if (collapsedBinIds && collapsedBinIds.length) {
                        bins.forEach((bin) => {
                            if (collapsedBinIds.indexOf(bin.id) !== -1) {
                                bin.collapsed = true
                            }
                        })
                    }

                    this.update({bins})

                    let groups = Promise.all(bins.map(bin => this.fetchAllGroups(bin.id)))
                    .then((results) => {

                        let groups = [].concat.apply([], results)
                        let collapsedIds = localStorage.getItem('media:groups:collapsed')

                        if (collapsedIds && collapsedIds.length) {
                            groups.forEach((group) => {
                                if (collapsedIds.indexOf(group.id) !== -1) {
                                    group.collapsed = true
                                }
                            })
                        }

                        groups.reverse()

                        this.update({
                            groups: groups
                        })
                    })

                    let files = Promise.all(bins.map(bin => this.fetchAllFiles(bin.id)))
                    .then((results) => {
                        this.update({
                            files: [].concat.apply([], results)
                        })
                    })

                    Promise.all([groups, files])
                    .then(() => {
                        let currentBin = this.bins.find(bin => bin.default)
                        let currentGroup = this.getCurrentGroup(currentBin.id)

                        if (opts.lock) {
                            let lockedBin = this.bins.find(bin => bin.id === opts.lock)
                            let lockedGroup = this.groups.find(bin => bin.id === opts.lock)

                            if (lockedBin) {
                                currentGroup = this.getCurrentGroup(lockedBin.id)
                            }

                            if (lockedGroup) {
                                currentGroup = this.getCurrentGroup(lockedGroup.id)
                            }
                        }

                        this.update({
                            loading: false,
                            bin_id: currentBin.id,
                            storage_name: currentBin.storage_name,
                            storage_driver: currentBin.storage_driver,
                            currentGroup: currentGroup
                        })
                    })
                }

            })
        })

        this.fetchAllEcoBins = () => {
            if (zesty.instance.ecoID) {
                return request(`${CONFIG.SERVICE_MEDIA_MANAGER}/eco/${zesty.instance.ecoID}/bins`)
                .then(json => {
                    if (json && json.code === 200) {
                        json.data.forEach(bin => bin.type = 'bin')
                        return json.data
                    } else {
                        return []
                    }
                })
            } else {
                return Promise.resolve([])
            }
        }

        this.fetchAllSiteBins = () => {
            if (zesty.instance.ID) {
                return request(`${CONFIG.SERVICE_MEDIA_MANAGER}/site/${zesty.instance.ID}/bins`)
                .then(json => {
                    if (typeof json.code == 'undefined') return []

                    if (json.code === 200) {
                        json.data.forEach(bin => bin.type = 'bin')
                        return json.data
                    } else {
                        return []
                    }
                })
            } else {
                return Promise.resolve([])
            }
        }

        this.fetchAllGroups = (binId) => {
            return request(`${CONFIG.SERVICE_MEDIA_MANAGER}/bin/${binId}/groups`)
            .then(json => {
                json.data.forEach(group => group.type = 'group')
                return json.data
            })
        }

        this.fetchAllFiles = (binId) => {
            return request(`${CONFIG.SERVICE_MEDIA_MANAGER}/bin/${binId}/files`)
            .then(json => {
                json.data.forEach(file => file.type = 'file')
                return json.data
            })
        }

        /**
         * Given a Bin or Group ID it will find the
         * one in memory
         * @param  {string} id zuid
         * @return {object}    group
         */
        this.getGroup = (id) => {
            let group = this.bins.find(bin => bin.id === id)
            if (!group) {
                group = this.groups.find(group => group.id === id)
            }
            return {...group}
        }

        /**
         * Given a Bin or Group ID it will return
         * the currentGroup representation
         * @param  {string} id zuid
         * @return {object}    currentGroup
         */
        this.getCurrentGroup = (id) => {
            let group = this.getGroup(id)

            group.files = this.files.filter(file => {
                if (file.group_id === id) {
                    return file
                }
            })
            group.groups = this.groups.filter(group => group.group_id === id)

            return {...group}
        }

        this.loadGroup = (group) => {
            this.update({
                loading: true
            })

            request(`${CONFIG.SERVICE_MEDIA_MANAGER}/group/${group.id}`)
            .then((result) => {
                // Find the existing in memory group and
                let currentGroup = this.getCurrentGroup(result.data[0].id)

                this.update({
                    loading: false,
                    bin_id: result.data[0].bin_id,
                    storage_name: result.data[0].storage_name,
                    storage_driver: result.data[0].storage_driver,
                    // merge response from API
                    // NOTE the data coming back from the server is
                    // overwriting local state. As such things like,
                    // selected state, are lost on this update
                    currentGroup: {...currentGroup, ...result.data[0]}
                })
            })
        }

        this.saveGroup = (group) => {
            request(`${CONFIG.SERVICE_MEDIA_MANAGER}/group/${group.id}`, {
                method: 'PATCH',
                body: group
            })
            .then((result) => {
                let update = (item) => {
                    if (item.id === result.data[0].id) {
                        return {...item, ...result.data[0]}
                    } else {
                        return item
                    }
                }

                this.update({
                    currentGroup: {...this.currentGroup, ...result.data[0]},
                    groups: this.groups.map(update),
                    bins: this.bins.map(update)
                })
            })
        }

        this.createGroup = (name) => {
            request(`${CONFIG.SERVICE_MEDIA_MANAGER}/group`, {
                method: 'POST',
                body: {
                    bin_id: this.bin_id,
                    group_id: this.currentGroup.id,
                    name: name
                }
            })
            .then((json) => {
                this.update({
                    groups: this.groups.concat(json.data[0])
                })
                return json
            })
            .then((json) => {
                this.update({
                    currentGroup: this.getCurrentGroup(json.data[0].id)
                })
            })
        }

        this.deleteGroup = (group) => {
            request(`${CONFIG.SERVICE_MEDIA_MANAGER}/group/${group.id}`, {
                method: 'DELETE'
            })
            .then((json) => {
                growl(`Deleted ${group.name}`)

                this.update({
                    currentGroup: this.getCurrentGroup(this.bins[0].id),
                    bins: this.bins.filter(el => el.id != group.id),
                    groups: this.groups.filter(el => el.id != group.id)
                })
            })
        }

        this.uploadFile = (files) => {
            if (Array.isArray(files)) {
                this.files = [...this.files, ...files]
            } else {
                this.files.push(files)
            }

            this.update({
                currentGroup: this.getCurrentGroup(this.currentGroup.id)
            })
        }

        this.previewFile = (id) => {
            // Set preview property of current group files
            let files = this.currentGroup.files.map((file) => {
                file.preview = (file.id === id) ? true : false;
                return file
            })

            // update current group with preview marked files
            this.update({
                currentGroup: {...this.currentGroup, files}
            })
        }

        this.selectFile = (el) => {
            let file = this.files.find((file) => file.id === el.id)
            file.selected = true
        }

        this.unselectFile = (el) => {
            let file = this.files.find((file) => file.id === el.id)
            file.selected = false
        }

        this.saveFile = (file) => {
            request(`${CONFIG.SERVICE_MEDIA_MANAGER}/file/${file.id}`, {
                method: 'PATCH',
                body: file
            })
            .then(json => {
                this.update({
                    files: this.files.map(file => {
                        if (file.id === json.data[0].id) {
                            return {...file, ...json.data[0], saving: false}
                        } else {
                            return file
                        }
                    })
                })
            })
            .then(() => {
                this.update({
                    currentGroup: this.getCurrentGroup(this.currentGroup.id)
                })
            })
        }

        this.deleteFile = (file) => {
            request(`${CONFIG.SERVICE_MEDIA_MANAGER}/file/${file.id}`, {
                method: 'DELETE'
            })
            .then((json) => {
                this.update({
                    files: this.files.filter(el => el.id != file.id),
                    selected: this.files.filter(file => file.selected)
                })
            })
            .then(() => {
                growl(`Deleted ${file.filename}`)
                this.update({
                    currentGroup: this.getCurrentGroup(this.currentGroup.id)
                })
            })
        }

        this.loadBin = (bin) => {
            this.update({
                loading: true
            })

            request(`${CONFIG.SERVICE_MEDIA_MANAGER}/bin/${bin.id}`)
            .then((result) => {
                // Find the existing in memory group and
                let currentGroup = this.getCurrentGroup(result.data[0].id)

                this.update({
                    loading: false,
                    bin_id: result.data[0].id,
                    storage_name: result.data[0].storage_name,
                    storage_driver: result.data[0].storage_driver,
                    // merge response from API
                    currentGroup: {...currentGroup, ...result.data[0]}
                })
            })
        }

        this.saveBin = (bin) => {
            request(`${CONFIG.SERVICE_MEDIA_MANAGER}/bin/${bin.id}`, {
                method: 'PATCH',
                body: bin
            })
            .then((result) => {
                let update = (item) => {
                    if (item.id === result.data[0].id) {
                        return {...item, ...result.data[0]}
                    } else {
                        return item
                    }
                }

                this.update({
                    currentGroup: {...this.currentGroup, ...result.data[0]},
                    groups: this.groups.map(update),
                    bins: this.bins.map(update)
                })
            })
        }

        this.search = (term) => {
            term = term.trim()

            if (term) {
                let searchResults = {...this.currentGroup}

                searchResults.files = this.files.filter(file => {
                    let re = new RegExp(term, 'gi')
                    let keys = Object.keys(file)

                    // Allows matching term to any file
                    // property, e.g. IDs, filenames, url, etc!
                    for (var i = keys.length - 1; i >= 0; i--) {
                        if (String(file[keys[i]]).match(re)) {
                            return true
                        }
                    }

                    return false
                })

                this.update({
                    currentGroup: searchResults
                })
            } else {
                this.update({
                    currentGroup: this.getCurrentGroup(this.currentGroup.id)
                })
            }
        }
    </script>
    <style>
    #media-manager #media {
        display: flex;
        overflow: hidden;
        height: 100%;
    }
    </style>
</media-app>
