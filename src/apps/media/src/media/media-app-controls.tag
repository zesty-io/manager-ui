<media-app-controls>
    <section class="control-bar">
        <z-button id="assetUpload" handler="{showFileModal}">
            <i class="fas fa-cloud-upload-alt"></i>&nbsp;Upload Files
        </z-button>
        <z-button id="createGroup" handler="{showGroupModal}">
            <i class="fas fa-plus"></i>&nbsp;New Group
        </z-button>
        <z-search-field handler="{search}" placeholder="Search across all your files"></z-search-field>
        <input type="file" id="upload" name="upload" onchange="{handleFileUpload}" multiple />
        <!--<z-button class="selectAll" handler="{selectAll}">
            <span class="pictos">|</span>&nbsp;Select All
            <media-bulk-actions></media-bulk-actions>
        </z-button>-->
        <z-button handler="{handleTutorial}">
            <i class="fas fa-video"></i>&nbsp;Tutorial
        </z-button>
    </section>
    <script type="es6">
        this.search = (evt) => {
            zesty.trigger('media:search', evt.target.value)
        }
        this.showGroupModal = () => {
            riot.mount(document.querySelector('#modalMount'), 'group-create-modal')
        }
        this.showFileModal = () => {
            this.upload.click()
            return false
        }
        this.handleTutorial = () => {
            riot.mount(document.querySelector('#modalMount'), 'media-app-tutorial')
        }
        this.handleFileUpload = (evt) => {
            let files = []
            for (var i = evt.target.files.length - 1; i >= 0; i--) {
                files.push({
                    bin_id: opts.bin_id,
                    group_id: opts.group.id,
                    filename: evt.target.files[i].name,
                    title: evt.target.files[i].name,
                    type: 'file',
                    file: evt.target.files[i],
                    url: window.URL.createObjectURL(evt.target.files[i]),
                    onload: function() {
                        window.URL.revokeObjectURL(this.url)
                    },
                    progress: 0,
                    loading: false,
                    upload: true,
                    storage_name: opts.storage_name,
                    storage_driver: opts.storage_driver
                })
            }

            zesty.trigger('media:file:upload', files)
        }
    </script>
    <style scoped>
        :scope {
            flex: none;
            height: 63px;
        }
        :scope #upload {
            visibility: hidden;
            width: 1px;
            height: 1px;
        }
        :scope .control-bar {
            background-color: #4C5568;
            display: flex;
            padding: 1em;
        }
        :scope .control-bar .z-search-field {
            margin-right: 1rem;
        }
        #assetUpload,
        #createGroup {
            margin: 0 0.5rem;
        }
        .control-bar .selectAll {
            margin-left: 2rem;
        }
    </style>
</media-app-controls>
