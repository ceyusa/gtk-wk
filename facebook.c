#include <gtk/gtk.h>
#include <webkit2/webkit2.h>

#include <string.h>

GtkWidget *main_window, *web_view;

static gboolean
reload_webview (gpointer data)
{
	webkit_web_view_reload_bypass_cache (data);

	return FALSE;
}

static gboolean
crashed (WebKitWebView *view, gpointer data)
{
	g_printerr ("The web view has crashed!\n");
	g_timeout_add_seconds (5, reload_webview, view);

	return TRUE; /* don't propagate event */
}

static void
changed (WebKitWebView *view, WebKitLoadEvent event, gpointer data)
{
	static gboolean shown = FALSE;

	g_print ("%d ", event);
	if (!shown && event == WEBKIT_LOAD_FINISHED) {
		gtk_widget_show_all (main_window);
		shown = TRUE;
	}
}

static gboolean
failed (WebKitWebView *view, WebKitLoadEvent event, gchar *uri, GError *err, gpointer data)
{
	g_printerr ("%s loading failed: %s\n", uri, err->message);

	return TRUE; /* don't propagate event */
}

static void
create ()
{
	main_window = gtk_window_new (GTK_WINDOW_TOPLEVEL);
	gtk_window_set_default_size (GTK_WINDOW (main_window), 640, 320);
	gtk_window_set_title (GTK_WINDOW (main_window), "Facebook");

	g_signal_connect(main_window, "destroy", G_CALLBACK (gtk_main_quit), NULL);

	web_view = webkit_web_view_new ();
	gtk_container_add (GTK_CONTAINER (main_window), web_view);

	WebKitSettings *settings = webkit_web_view_get_settings (WEBKIT_WEB_VIEW (web_view));
	g_object_set (G_OBJECT (settings), "enable-fullscreen", TRUE,
		      "enable-developer-extras", TRUE,
		      "enable-plugins", FALSE, NULL);

	g_object_connect (G_OBJECT(web_view),
			  "signal::web-process-crashed", G_CALLBACK (crashed), NULL,
			  "signal::load-changed", G_CALLBACK (changed), NULL,
			  "signal::load-failed", G_CALLBACK (failed), NULL,
			  NULL);
}

static gboolean
load (gpointer pointer)
{
	webkit_web_view_load_uri (WEBKIT_WEB_VIEW (web_view), "https://m.facebook.com");
	return FALSE;
}

#define CDIR "/tmp/wkgtktest/"

static void
cookies ()
{
	if (!g_mkdir_with_parents (CDIR, 00755)) {
		webkit_cookie_manager_set_persistent_storage (
			webkit_web_context_get_cookie_manager (
				webkit_web_context_get_default ()),
			CDIR "fbcookies.sqlite",
			WEBKIT_COOKIE_PERSISTENT_STORAGE_SQLITE);
	}
}

int
main(int argc, char **argv)
{
	gtk_init (&argc, &argv);
	create ();
	cookies ();
	g_idle_add (load, NULL);
	gtk_main ();

	return 0;
}

