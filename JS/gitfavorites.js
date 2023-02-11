import { GithubUsers } from "./githubuser.js";

export class GitFavs {
    constructor(root) {
        this.root = document.querySelector(root);
        this.loadStorage();
    };

    loadStorage() {
        this.entries = JSON.parse(localStorage.getItem("@github-gitfavs:")) || [];
        
        if(this.entries.length > 0) {
            $('.no-favorites').hide();
        };
    };

    saveStorage() {
        localStorage.setItem("@github-gitfavs:", JSON.stringify(this.entries));
    };

    async addUser(username) {

        try {
            const userAlreadyExists = this.entries.find(entry => entry.login === username);
            
            if(userAlreadyExists) {
                throw new Error("O usuário já existe!");                
            };
            
            const user = await GithubUsers.search(username);

            if(user.login === undefined) {
                throw new Error("O usuário não pode ser encontrado! Digite um usuário válido!");
            };
            // this.entries.push(user);
            this.entries = [user, ...this.entries];
            this.updateTr();
            this.saveStorage();
        }catch(error) {
            alert(error.message);
        };
    };

    deleteUser(user) {
        this.entries = this.entries.filter(entry => entry.login !== user.login);
        this.updateTr();
        this.saveStorage();  

        if(this.entries <= 0) {
            $('.no-favorites').fadeIn('fast');
        };
    };
};

export class GitFavoritesView extends GitFavs {
    constructor(root) {
        super(root);

        this.tbody = this.root.querySelector('table tbody');
        this.updateTr();
        this.onadd();
    };

    onadd() {
        this.root.querySelector('.search button').onclick = () => {
            const { value } = this.root.querySelector('.search input');
            this.addUser(value);  

            if(value.length > 0) {
                $('.no-favorites').hide();
            };
        };
    };

    updateTr() {
        this.removeAllElements();

        this.entries.forEach(user => {
            const newRow = this.createElement()

            newRow.querySelector('.user img').src = `https://github.com/${user.login}.png`;
            newRow.querySelector('.user img').alt = `Imagem de ${user.name}`;
            newRow.querySelector('.user a').href = `https://github.com/${user.login}`;
            newRow.querySelector('.user p').textContent = user.name
            newRow.querySelector('.user span').textContent = `/ ${user.login}`;
            newRow.querySelector('.repositories').textContent = user.public_repos;
            newRow.querySelector('.followers').textContent = user.followers;
            newRow.querySelector('.remove').onclick = () => {
                const isOk = confirm('Tem certeza que deseja excluir este usuário dos seus favoritos?')

                if(isOk) {
                    this.deleteUser(user)
                };
            };
            this.tbody.append(newRow);
        });
    };

    createElement() {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td class="user">
                <img src="https://github.com/ViniciusALeite.png" alt="Imagem de Vinicius Araujo">
                <a href="https://github.com/ViniciusALeite" target="_blank">
                <p>Vinicius Araujo</p>
                <span>/ViniciusALeite</span>
                </a>
            </td>
            <td class="repositories">75</td>
            <td class="followers">10000</td>
            <td class="remove">Remover</td>`        
        return tr;
    };

    removeAllElements() {
        this.tbody.querySelectorAll('tr').forEach((tr) => {tr.remove()});
    };
};