<z-button-alert>
    <button
        class="{alert: opts.type === 'alert'}"
        onclick="{opts.handler}"
        style="line-height: {opts.height};"
        data-id="{this.id}">
        <yield />
    </button>
    <style scoped>
        :scope button {
            border: none;
            border-radius: 3px 3px 0px 3px;
            cursor: pointer;
            <!--  font-size: 1.3rem;  -->
            background: #D26060;
            color: #FFF;
            text-shadow: 1px 1px 1px #6D3434;
            border-bottom: 3px solid #B95555;
            border-right: 2px solid #AD4A4A;
            letter-spacing: 0.4px;
            padding: 0.5rem 0.8rem;
        }
        :scope button:hover {
            background: #C35555;
        }
        :scope button:active {
            border-bottom-width: 2px;
            margin-top: 1px;
        }
        :scope button:focus {
            outline: none;
        }
    </style>
</z-button-alert>
