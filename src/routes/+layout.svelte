<script>
	import { Toaster } from 'svelte-sonner';
	import '../app.scss';
	import { io } from '$lib/websocketConnection';
	io.connect();
</script>

<Toaster position="bottom-left" richColors />
<slot></slot>
