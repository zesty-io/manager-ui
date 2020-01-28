<login-modal>
    <section id="loginModal">
        <z-modal email="{opts.email}" secure="{true}">
            <section class="wrap">
                <img src="/ui/images/zesty-logo.png" alt="" />
                <p class="message">
                    {zesty.user.name}, you were gone too long so we logged you out. Please log back in to continue.
                </p>
                <form id="relogin">
                    <label for="email">
                        <span>Email</span>
                        <input type="email" name="email" placeholder="e.g. hello@zesty.io" value="{opts.email}">
                    </label>
                    <label for="password">
                        <span>Password</span>
                        <input type="password" name="password" value="">
                    </label>

                    <z-button handler="{parent.login}">Resume</z-button>
                </form>
                <form id="two-fa">
                    <label>
                        <span>TWO-FACTOR VERIFICATION CODE</span>
                        <small class="one-touch-note">(or approve with Authy OneTouch)</small>
                        <input name="token" type="text" autocomplete="off" />
                    </label>

                    <z-button handler="{parent.verify}">Confirm Login</z-button>
                </form>
                <div class="error"></div>
            </section>
        </z-modal>
    </section>
    <script type="es6">
        this.logout = () => {
            setTimeout(() => {
                window.location = `${CONFIG.apps.accounts}/logout`
            }, 2000)
        }

        this.login = (evt) => {
            evt.preventDefault()
            request(`${CONFIG.SERVICE_AUTH}/login`, {
                body: {
                    email: this.tags['z-modal'].email.value,
                    password: this.tags['z-modal'].password.value
                }
            })
            .then((json) => {
                switch (json.code) {
                    case 200:
                        opts.callback()
                        this.tags['z-modal'].close()
                        break;
                    case 202:
                        this.tags['z-modal'].root.querySelector('.message').innerText = ''
                        this.tags['z-modal']['relogin'].style.display = 'none'
                        this.tags['z-modal']['two-fa'].style.display = 'block'
                        this.pollVerify()
                        break;
                    case 400:
                    case 401:
                    case 404:
                        this.root.querySelector('.message').innerText = json.message
                        break;
                    default:
                        this.root.querySelector('.message').innerText = 'Failed to login. Redirecting.'
                        this.logout()
                }
            })
        }

        this.verify = (evt) => {
            evt.preventDefault()
            request(`${CONFIG.SERVICE_AUTH}/verify-2fa`, {
                body: {
                    token: this.tags['z-modal'].token.value
                }
            })
            .then((json) => {
                switch (json.code) {
                    case 200:
                        opts.callback()
                        this.tags['z-modal'].close()
                        break;
                    case 400:
                    case 401:
                        this.root.querySelector('.message').innerText = json.message
                        break;
                    default:
                        this.root.querySelector('.message').innerText = 'Failed to login. Redirecting.'
                        this.logout()
                }
            })
        }

        // Poll Auth service for OneTouch
        // response with back off
        this.pollVerify = (count) => {
            count = count || 0
            count++;
            setTimeout(() => {
                request(`${CONFIG.SERVICE_AUTH}/verify-2fa`)
                .then((json) => {
                    let message = this.tags['z-modal'].root.querySelector('.message')

                    if (json.code === 202) {
                        return this.pollVerify(count)

                    } else if (json.code === 200) {
                        opts.callback()
                        this.tags['z-modal'].close()

                    } else if (json.code === 401) {
                        message.innerText = 'Your login request was denied. Redirecting to login.'
                        this.logout()

                    } else if (json.code === 410) {
                        message.innerText = 'Your login request has expired. Redirecting to login.'
                        this.logout()

                    } else {
                        message.innerText = 'It seems we had an issue validating this login request. Redirecting to login.'
                        this.logout()
                    }
                })
                .catch((err) => {
                    let message = this.tags['z-modal'].root.querySelector('.message')
                    message.innerText = 'Login failed. Please <a href="mailto:support@zesty.io">contact support</a>.'
                })
            }, Math.min(count*0.5, 15) * 1000)
        }

        this.on('mount', () => {
            this.tags['z-modal'].password.focus()
        })

    </script>
    <style media="scoped">
        /* Modal style overrides */
        #loginModal #modal {
            background: #202631;
            border: 1px solid #495160;
            padding: 2rem;
            height: 450px;
            width: 330px;
        }
        #loginModal #modal .close {
            display: none;
        }

        #loginModal .wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        #loginModal .message {
            width: 28rem;
            <!--  font-size: 1.4rem;  -->
            line-height: 1.8rem;
            margin: 0 0 2rem;
            color: #97a5bf;
        }
        #loginModal form {
            min-width: 30rem;
        }
        #loginModal form label {
            color: #5B667D;
            margin-bottom: 1rem;
            display: flex;
            letter-spacing: 1px;
            <!--  font-size: 1rem;  -->
            font-weight: bold;
            text-transform: uppercase;
            flex-direction: column;
        }
        #loginModal form label span {
            margin: 0 1rem 0.5rem
        }
        #loginModal form label small {
            text-transform: none;
            margin: 0 1rem 0.5rem;
            color: #445671;
            font-weight: 200;
        }
        #loginModal form label input {
            display: block;
            border: none;
            font: 14px/16px 'NobileRegular', Arial, sans-serif;
            letter-spacing: .04em;
            color: #99A2AF;
            padding: 8px 3%;
            background-color: #3B495F;
            border-radius: 5px;
            margin: 0 0.7rem;
        }
        #loginModal form label input:active,
        #loginModal form label input:focus {
            background-color: #D1D6DF;
            color: #141E2F;
            outline-width: 0;
        }
        #loginModal z-button {
            margin: 0 0 0 0.8rem;
        }
        #loginModal form#two-fa {
            display: none;
        }
    </style>
</login-modal>
