<media-sidebar-item>
    <ul class="tree">
        <li class="leaf {selected: this.dir.selected}">
            <h1
                class="item {this.dir.type} {over: over} {children: this.children.length}"
                onclick="{load}"
                draggable="true"
                title="CMD + Click to collapse group">

                <span class="caret" onclick="{handleCollapse}">
                    <i if="{!this.dir.collapsed && this.children.length}" class="icon-caret-down"></i>
                    <i if="{this.dir.collapsed && this.children.length}" class="icon-caret-right"></i>
                </span>

                <span class="folder">
                    <i if="{this.dir.type === 'group' && !this.dir.selected && !over}" class="icon icon-folder-close-alt">&nbsp;</i>
                    <i if="{this.dir.type === 'group' && this.dir.selected && !over}" class="icon icon-folder-open-alt">&nbsp;</i>
                    <i if="{this.dir.type === 'bin' && !over}" class="icon icon-cloud">&nbsp;</i>
                    <i if="{over}" class="icon icon-cloud-upload">&nbsp;</i>
                </span>

                <span class="name">
                    {this.dir.name}
                </span>

                <i class="icon-move"></i>
            </h1>
            <ul class="tree" if="{this.dir.collapsed}">
                <li class="leaf">
                    <h1 class="item collapsed">
                        <i class="icon icon-ellipsis-horizontal">&nbsp;</i>
                    </h1>
                </li>
            </ul>
            <media-sidebar-item
                if="{!parent.dir.collapsed}"
                each="{dir in this.children}"
                bins="{parent.opts.bins}"
                groups="{parent.opts.groups}">
            </media-sidebar-item>
        </li>
    </ul>
    <script type="es6">
        this.children = []

        this.load = (evt) => {
            evt.stopPropagation()

            if (evt.metaKey) {
                // Only collapse groups with children
                if (this.children.length) {
                    this.handleCollapse()
                }
            } else {
                opts.groups.forEach((group) => {
                    if (group.id === this.dir.id) {
                        group.selected = true
                    } else {
                        group.selected = false
                    }
                })

                if (this.dir.type === 'group') {
                    zesty.trigger('media:group:load', this.dir)
                } else if (this.dir.type === 'bin') {
                    zesty.trigger('media:bin:load', this.dir)
                }
            }
        }

        this.getChildren = () => {
            return opts.groups.filter(group => group.group_id === this.dir.id)
        }

        this.handleDrop = (evt, parentIds) => {
            let file = evt.dataTransfer.getData('file')
            let group = evt.dataTransfer.getData('group')

            if (file) {
                file = JSON.parse(file)
                file.group_id = this.dir.id
                zesty.trigger('media:file:save', file)

            } else if (group) {
                const child = JSON.parse(group)
                const isSelf = child.id === this.dir.id
                const isChild = parentIds.filter(id => id === child.id)

                // // Don't nest a group to itself or it's children
                if (!isSelf && !isChild.length) {
                    zesty.trigger('media:group:save', {...child, group_id: this.dir.id})
                } else {
                    growl('You can not nest a parent group to a child group', 'red-growl')
                }

            }
        }

        this.handleCollapse = (evt) => {
            evt.stopPropagation()
            this.dir.collapsed = this.dir.collapsed ? false : true;

            if (this.dir.type === 'bin') {
                let ids = opts.bins.filter(el => el.collapsed).map(el => el.id)
                localStorage.setItem('media:bins:collapsed', ids)
            } else {
                let ids = opts.groups.filter(el => el.collapsed).map(el => el.id)
                localStorage.setItem('media:groups:collapsed', ids)
            }
        }

        this.on('mount', () => {
            this.children = this.getChildren()

            // !!! This list of parent ids is used to prevent
            // nesting a parent group to a child group
            // it is built recursivly by the tags mounting
              const parentIds = [].concat(this.parent.ids).concat(this.dir.id)
            this.ids = [].concat(parentIds)

            const target = this.root.querySelector('.leaf')
            DnD.start(this.root.querySelector('.item'), 'group', this.dir)
            DnD.over(target, () => {
                this.over = true
                this.update()
            })
            DnD.leave(target, () => {
                this.over = false
                this.update()
            })

            DnD.drop(target, (evt) => {
                this.over = false
                this.handleDrop(evt, parentIds)
            })

        })

        this.on('update', () => {
            this.children = this.getChildren()
        })
    </script>
    <style>
    .tree {
        margin: 0;
        padding: 0;
    }
    .tree .leaf {
        background-color: #242b3c;
        border-left: 15px solid #3c465e;
        color: #c3cddf;
    }
    .tree .leaf:hover,
    .tree .leaf:active,
    .tree .leaf:focus {
        cursor: pointer;
        color: #e4e9f1;
        background-color: #4b597b;
    }
    .tree .leaf.selected,
    .tree .leaf.selected .bin {
        background: #C7D4EA;
        color: #1b202c;
    }
    .tree .leaf .item {
        align-items: center;
        <!--  font-size: 1.2rem;  -->
        font-weight: 500;
        display: flex;
        padding: 0;
        margin: 0;
        border-bottom: 1px solid #1b202c;
        word-break: break-all;
    }
    .tree .leaf .item.collapsed {
        background: #1f2635;
        padding: 0.3rem 1rem;
    }
    .tree .leaf .bin {
        background-color: #1b202c;
    }

    .tree .leaf .item .caret i {
        display: inline-block;
        padding: 1rem;
    }

    .tree .leaf .item .folder {
        padding: 1rem 0.3rem 1rem 2.4rem;
    }
    .tree .leaf .item.children .folder {
        padding-left: 0;
    }
    .tree .leaf .item .name {
        flex: 1;
        font-family: "Gibson Light", Arial, sans-serif;
        padding: 1rem 0;
        line-height: 16px;
    }

    .tree .leaf .item.bin .name {
        <!--  font-size: 1.4em;  -->
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .tree .leaf .item.bin .folder {
        padding: 1rem 0.3rem 1rem 2.6rem;
    }

    .tree .leaf .item.bin.children .folder{
        padding-left: 0;
    }

    .tree .leaf.selected>.item .icon,
    .tree .leaf .item.over .icon.icon-cloud-upload {
        color: #E53C05;
    }
    .tree .leaf .item .icon-move {
        padding: 1rem;
    }
    .tree .leaf .item.bin .icon-move {
        display: none;
    }
    .tree .leaf .item.group .icon-move {
        visibility: hidden;
        color: #c1cbdd;
    }
    .tree .leaf .item.group:hover .icon-move,
    .tree .leaf .item.group:active .icon-move,
    .tree .leaf .item.group:focus .icon-move {
        visibility: visible;
    }
    </style>
</media-sidebar-item>
