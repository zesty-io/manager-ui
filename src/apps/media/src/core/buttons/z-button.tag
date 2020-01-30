<z-button>
    <button
        class="{alert: opts.type === 'alert'}"
        onclick="{opts.handler}"
        style="line-height: {opts.height};"
        data-id="{this.id}">
        <yield></yield>
    </button>
    <style scoped>
        :scope button {
            border: none;
            border-radius: 3px 3px 0px 3px;
            cursor: pointer;
            <!--  font-size: 1.3rem;  -->
            background: #5B667D;
            color: #EFEFEF;
            text-shadow: 1px 1px 1px #525C69;
            border-bottom: 3px solid #464e5f;
            border-right: 2px solid #6F819A;
            letter-spacing: 0.4px;
            padding: 0.5rem 0.8rem
        }
        :scope button:hover {
            background: rgb(121, 135, 154);
        }
        :scope button:active {
            border-bottom-width: 2px;
            margin-top: 1px;
        }
        :scope button:focus {
            outline: none;
        }
    </style>
</z-button>
