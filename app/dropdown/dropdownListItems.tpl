<% items.forEach((id) => { %>
      <div class="dropdown-list__item js-dropdown-item" data-id="<%-id%>">
        <% if (!noAvatar) { %>
          <img class="dropdown-list__image" src="<%-itemsById[id].img%>" />
        <% } %>
        <div class="dropdown-list__name"><%-itemsById[id].name%></div>
      </div>
<% }); %>
<% if (!items.length) { %>
  <div class="dropdown-list__item dropdown-list__item--empty">
    Результаты не найдены
  </div>
<% } %>