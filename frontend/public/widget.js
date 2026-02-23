(function () {
  const Agentrix = {
    init: function (config) {
      console.log('Agentrix Widget initialized', config);
      const { assistantId, apiKey, position } = config;
      if (!assistantId || !apiKey) {
        console.error('Agentrix: Missing assistantId or apiKey');
        return;
      }

      // Create floating button
      const btn = document.createElement('div');
      btn.innerHTML = `
        <button style="
          all: unset;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #000;
          color: #fff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" x2="12" y1="19" y2="22"/>
          </svg>
        </button>
      `;

      btn.style.position = 'fixed';
      btn.style.zIndex = '99999';
      btn.style.fontFamily = 'system-ui, -apple-system, sans-serif';

      if (position === 'bottom-left') {
        btn.style.bottom = '20px';
        btn.style.left = '20px';
      } else {
        btn.style.bottom = '20px';
        btn.style.right = '20px';
      }

      document.body.appendChild(btn);

      // Simple click handler
      btn.addEventListener('click', () => {
        // Here you would implement the actual voice recorder and API call
        // For now, just a demo alert
        const msg = `Agentrix Integration Active!\n\nAssistant ID: ${assistantId}\nPublic Key: ${apiKey}\n\nBackend endpoint: /api/public/voice-chat`;
        alert(msg);

        // Example API call
        /*
        fetch('http://localhost:5000/api/public/voice-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            assistantId,
            message: "Hello!"
          })
        }).then(res => res.json()).then(console.log);
        */
      });
    }
  };

  window.Agentrix = Agentrix;
})();
