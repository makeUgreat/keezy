document.addEventListener('DOMContentLoaded', function() {

  // Reveal / hide secret values
  document.querySelectorAll('.reveal-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var parent = btn.closest('.bg-white');
      var codeEl = parent.querySelector('.secret-value');
      var plainEl = parent.querySelector('.secret-plain');

      if (codeEl.dataset.revealed === 'false') {
        codeEl.textContent = plainEl.textContent;
        codeEl.dataset.revealed = 'true';
        btn.textContent = 'Hide';
      } else {
        codeEl.textContent = '********';
        codeEl.dataset.revealed = 'false';
        btn.textContent = 'Show';
      }
    });
  });

  // Copy secret value to clipboard
  document.querySelectorAll('.copy-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var value = btn.dataset.value;
      navigator.clipboard.writeText(value).then(function() {
        var original = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(function() { btn.textContent = original; }, 1500);
      });
    });
  });

  // Delete confirmation modal
  document.querySelectorAll('.delete-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var name = btn.dataset.name;
      var modal = document.getElementById('confirmModal');
      var form = document.getElementById('confirmForm');
      var msg = document.getElementById('confirmMessage');

      msg.textContent = 'Are you sure you want to delete secret "' + name + '"?';
      form.action = '/secrets/' + encodeURIComponent(name) + '/delete';
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    });
  });

  // Cancel delete modal
  var cancelBtn = document.getElementById('cancelDeleteBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
      var modal = document.getElementById('confirmModal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    });
  }

  // Flash message dismiss
  document.querySelectorAll('.flash-dismiss').forEach(function(btn) {
    btn.addEventListener('click', function() {
      btn.parentElement.remove();
    });
  });

  // Auto-submit selects (context/namespace switcher)
  document.querySelectorAll('.auto-submit').forEach(function(select) {
    select.addEventListener('change', function() {
      select.closest('form').submit();
    });
  });

  // Dynamic form entries - Add
  var addBtn = document.getElementById('addEntryBtn');
  if (addBtn) {
    addBtn.addEventListener('click', function() {
      var container = document.getElementById('secretEntries');
      var row = document.createElement('div');
      row.className = 'flex gap-2 mb-2 entry-row';
      row.innerHTML =
        '<input type="text" name="keys" placeholder="Key" ' +
        'class="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">' +
        '<input type="text" name="values" placeholder="Value" ' +
        'class="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">' +
        '<button type="button" class="px-3 py-2 text-red-600 hover:bg-red-50 rounded remove-entry-btn">&times;</button>';
      container.appendChild(row);
      row.querySelector('.remove-entry-btn').addEventListener('click', function() {
        removeEntry(this);
      });
    });
  }

  // Dynamic form entries - Remove (delegated for initial rows)
  document.querySelectorAll('.remove-entry-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      removeEntry(this);
    });
  });

  function removeEntry(btn) {
    var rows = document.querySelectorAll('.entry-row');
    if (rows.length > 1) {
      btn.closest('.entry-row').remove();
    }
  }

  // Load namespace list for navbar dropdown
  var nsSelect = document.getElementById('nsSelect');
  if (nsSelect) {
    fetch('/api/namespaces')
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (!data.namespaces) return;
        var current = nsSelect.value;
        nsSelect.innerHTML = '';
        data.namespaces.forEach(function(ns) {
          var opt = document.createElement('option');
          opt.value = ns;
          opt.textContent = ns;
          if (ns === current) opt.selected = true;
          nsSelect.appendChild(opt);
        });
      })
      .catch(function() { /* keep current option */ });
  }

  // Auto-dismiss flash messages
  setTimeout(function() {
    document.querySelectorAll('.flash-message').forEach(function(el) {
      el.style.transition = 'opacity 0.5s';
      el.style.opacity = '0';
      setTimeout(function() { el.remove(); }, 500);
    });
  }, 5000);

});