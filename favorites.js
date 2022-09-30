import { GithubUser } from './GithubUser.js'
// classe que vai conter a lógica dos dados
// como os dados serão estruturados
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  // JSON.parse serve para converter a string em array

  // Pega o que está no localStorage e converte em JSON
  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  // Salva os dados do JSON no localStorge convertendo em string
  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  // async é uma função assincrona
  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username)

      // Passa no catch o erro se tiver
      if (userExists) {
        throw new Error('Usuário já cadastrado')
      }

      const user = await GithubUser.search(username)

      if (user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      entry => entry.login !== user.login
    )
    // atualiza os entries (memória)
    this.entries = filteredEntries
    // atualiza a lista da tela
    this.update()
    // atualiza os dados do localStorage
    this.save()
  }
}

// classe que vai criar a visualização e eventos HTML
// Extends faz a junção de uma class com outra
// super(root) faz a cola entre as classes
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onAdd()
  }

  onAdd() {
    const addForm = this.root.querySelector('.search')
    addForm.onsubmit = e => {
      e.preventDefault()
      const { value } = this.root.querySelector('.search input')
      this.add(value)
      addForm.reset()
    }
  }

  update() {
    this.removeAllTr()

    this.entries.forEach(user => {
      const row = this.creatRow()

      row.querySelector(
        '.user img'
      ).src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar essa linha?')
        if (isOk) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
  }

  creatRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
    <td class="user">
      <img src="" alt="">
      <a href="#" target="_blank">
        <p></p>
        <span></span>
      </a>
    </td>
    <td class="repositories">
    </td>
    <td class="followers">
    </td>
    <td>
      <button class="remove">remove</button>
    </td>
  `

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach(tr => {
      tr.remove()
    })
  }
}
