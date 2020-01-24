<media-group-row>
    <div class="mediaGroupRow">
        <media-file each="{file in opts.files}" file="{file}"></media-file>
        <media-drawer if="{preview}" file="{preview}"></media-drawer>
    </div>
    <script type="es6">
        this.on('update', () => {
            this.preview = opts.files.find(file => file.preview)
        })
    </script>
    <style scoped>
        .mediaGroupRow {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
        }
    </style>
</media-group-row>
