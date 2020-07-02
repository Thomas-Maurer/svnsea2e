import ActorSheetSS2e from './base.js'

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class ActorSheetSS2eShip extends ActorSheetSS2e {
  /** @override */
  static get defaultOptions () {
    return mergeObject(super.defaultOptions, {
      classes: ['svnsea2e', 'sheet', 'actor', 'ship'],
      template: 'systems/svnsea2e/templates/actors/ship.html',
      tabs: [{
        navSelector: '.sheet-tabs',
        contentSelector: '.sheet-body',
        initial: 'roster'
      }]
    })
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareShipItems (data) {
    const actorData = data.actor

    // Initialize containers.
    const adventures = []
    console.log(data.items)
    // Iterate through items, allocating to containers
    // let totalWeight = 0
    for (const i of data.items) {
      console.log(i.type)
      // Append to item types to their arrays
      if (i.type === 'shipadventure') {
        adventures.push(i)
      }
    }

    // Assign and return
    actorData.adventures = adventures
  }

  /**
   * Process any flags that the actor might have that would affect the sheet .
   *
   * @param {Obejct} data The data object to update with any flag data.
   * @param {Object} flags The set of flags for the Actor
   */
  _processFlags (data, flags) {
    let svnsea2e = flags.svnsea2e

    if (!svnsea2e) svnsea2e = {}
    if (!svnsea2e.shipsCrew) svnsea2e.shipsCrew = {}
    if (!svnsea2e.shipsCrew.members) svnsea2e.shipsCrew.members = []

    const crew = {
      ableseaman: { label: game.i18n.localize('SVNSEA2E.AbleSeaman'), cssClass: 'ableseaman', actors: [], dataset: { type: 'shipsCrew', role: 'ableseaman' } },
      boatswain: { label: game.i18n.localize('SVNSEA2E.Boatswain'), cssClass: 'boatswain', actors: [], dataset: { type: 'shipsCrew', role: 'boatswain' } },
      captain: { label: game.i18n.localize('SVNSEA2E.Captain'), cssClass: 'captain', actors: [], dataset: { type: 'shipsCrew', role: 'captain' } },
      mastergunner: { label: game.i18n.localize('SVNSEA2E.MasterGunner'), cssClass: 'mastergunner', actors: [], dataset: { type: 'shipsCrew', role: 'mastergunner' } },
      mastermariner: { label: game.i18n.localize('SVNSEA2E.MasterMariner'), cssClass: 'mastermariner', actors: [], dataset: { type: 'shipsCrew', role: 'mastermariner' } },
      midshipmen: { label: game.i18n.localize('SVNSEA2E.Midshipmen'), cssClass: 'midshipmen', actors: [], dataset: { type: 'shipsCrew', role: 'midshipmen' } },
      seaman: { label: game.i18n.localize('SVNSEA2E.Seaman'), cssClass: 'seaman', actors: [], dataset: { type: 'shipsCrew', role: 'seaman' } },
      shipsmaster: { label: game.i18n.localize('SVNSEA2E.ShipsMaster'), cssClass: 'shipsmaster', actors: [], dataset: { type: 'shipsCrew', role: 'shipsmaster' } },
      surgeon: { label: game.i18n.localize('SVNSEA2E.Surgeon'), cssClass: 'surgeon', actors: [], dataset: { type: 'shipsCrew', role: 'surgeon' } }
    }

    const [ableseaman, boatswain, captain, mastergunner, mastermariner, midshipmen, seaman, shipsmaster, surgeon] = svnsea2e.shipsCrew.members.reduce((arr, id) => {
      const actor = game.actors.get(id)

      if (!actor) return arr

      const crewMember = actor.getFlag('svnsea2e', 'crewMember') || null
      if (!crewMember) return arr

      if (crewMember.role === 'ableseaman') arr[0].push(actor)
      else if (crewMember.role === 'boatswain') arr[1].push(actor)
      else if (crewMember.role === 'captain') arr[2].push(actor)
      else if (crewMember.role === 'mastergunner') arr[3].push(actor)
      else if (crewMember.role === 'mastermariner') arr[4].push(actor)
      else if (crewMember.role === 'midshipmen') arr[5].push(actor)
      else if (crewMember.role === 'seaman') arr[6].push(actor)
      else if (crewMember.role === 'shipsmaster') arr[7].push(actor)
      else if (crewMember.role === 'surgeon') arr[8].push(actor)

      return arr
    }, [[], [], [], [], [], [], [], [], []])

    crew.ableseaman.actors = ableseaman
    crew.boatswain.actors = boatswain
    crew.captain.actors = captain
    crew.mastergunner.actors = mastergunner
    crew.mastermariner.actors = mastermariner
    crew.midshipmen.actors = midshipmen
    crew.seaman.actors = seaman
    crew.shipsmaster.actors = shipsmaster
    crew.surgeon.actors = surgeon

    data.crew = Object.values(crew)
    console.log(data.crew)
  }

  /**
   * Activate event listeners using the prepared sheet HTML
   *
   * @param {HTML} html The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners (html) {
    super.activateListeners(html)

    if (!this.options.editable) return

    html.find('.roster .item-delete').click(this._onRemoveFromCrew.bind(this))

    const handler = ev => this._onDragCrewStart(ev)
    html.find('.roster li.item').each((i, li) => {
      li.setAttribute('draggable', true)
      li.addEventListener('dragstart', handler, false)
    })

    html.find('.roster .items-list').each((i, li) => {
      li.addEventListener('dragover', this._onCrewDragOver.bind(this), false)
    })

    html.find('.roster li.item-header').each((i, li) => {
      li.addEventListener('dragenter', this._onCrewDragEnter, false)
      li.addEventListener('dragleave', this._onCrewDragLeave, false)
    })

    html.find('.adventures .item-create').click(this._onItemCreate.bind(this))

    // Update Inventory Item
    html.find('.adventures .item-edit').click(ev => {
      const li = $(ev.currentTarget).parents('.item')
      const item = this.actor.getOwnedItem(li.data('itemId'))
      item.sheet.render(true)
    })

    // Delete Inventory Item
    html.find('.adventures .item-delete').click(this._onItemDelete.bind(this))

    html.find('.adventures .item h4.item-name').click(event => this._onItemSummary(event))
  }

  /** @override */
  async _onDrop (event) {
    event.preventDefault()

    let data
    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'))
    } catch (err) {
      return false
    }

    if (!data) return false

    // Case 1 - Dropped Item
    if (data.type === 'Item') { return false }

    // Case 2 - Dropped Actor
    if (data.type === 'Actor') { return this._onCrewDrop(event, data) }
  }

  /**
   * Handles drop events for the Crew list
   *
   * @param {Event}  event The originating drop event
   * @param {object} data  The data transfer object.
   */
  async _onCrewDrop (event, data) {
    console.log('crew drop event', event, event.target.dataset)
    console.log('crew drop data', data)
    event.preventDefault()

    $(event.target).css('background', '')

    if (!data.id) return false

    const c = this.actor.getFlag('svnsea2e', 'shipsCrew')
    let crew

    if (c) crew = duplicate(c)
    else {
      crew = {
        members: []
      }
    }

    if (!crew.members) {
      crew.members = [data.id]
    } else if (!crew.members.includes(data.id)) {
      crew.members.push(data.id)
    }

    const actor = game.actors.get(data.id)

    if (!actor) return false

    const role = event.target.dataset.role

    await actor.setCrewMemberRole(this.actor.id, role)
    this.actor.update({
      'flags.svnsea2e.shipsCrew': crew
    }).then(this.render(false))

    return false
  }

  /**
   * Handles dragenter for the crews tab
   * @param {Event} event The originating dragenter event
   */
  _onCrewDragEnter (event) {
    $(event.target).css('background', 'rgba(0,0,0,0.3)')
  }

  /**
   * Handles dragleave for the crews tab
   * @param {Event} event The originating dragleave event
   */
  _onCrewDragLeave (event) {
    $(event.target).css('background', '')
  }

  /**
   * Handle dragging crew members on the sheet.
   *
   * @param {Event} event Originating dragstart event
   */
  _onDragCrewStart (event) {
    console.log('crew start', event)
    const actorId = event.currentTarget.dataset.actorId
    const actor = game.actors.get(actorId)

    const dragData = {
      type: 'Actor',
      id: actor.id,
      data: actor.data
    }

    if (this.actor.isToken) dragData.tokenId = actorId
    event.dataTransfer.setData('text/plain', JSON.stringify(dragData))
  }

  /**
   * Handles ondragover for crew drag-n-drop
   *
   * @param {Event} event Orgininating ondragover event
   */
  _onCrewDragOver (event) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  /**
   * Handles updating this crew's role on the ship.
   *
   * @param {Event} event The originating click event
   */
  async _onChangeCrewRole (event) {
    event.preventDefault()

    const actorId = event.currentTarget.parentElement.dataset.actorId
    const actor = game.actors.get(actorId)

    await actor.setCrewMemberRole(this.actor.id)
  }

  /**
   * Remove an actor from the crew.
   *
   * @param {Event} event The originating click event
   */
  async _onRemoveFromCrew (event) {
    event.preventDefault()

    const actorId = $(event.currentTarget).parents('.item').data('actorId')
    const actor = game.actors.get(actorId)

    await actor.removeFromCrew()

    const shipsCrew = this.actor.getFlag('svnsea2e', 'shipsCrew')

    if (!shipsCrew) return

    const updateData = shipsCrew.members.filter((val) => val !== actor.id)

    await this.actor.update({ 'flags.svnsea2e.shipsCrew.members': updateData })
  }
}