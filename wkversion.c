#include <webkit2/webkit2.h>

int
main (int argc, char **argv)
{
	g_print ("Using WebKitGTK+ v%d.%d.%d\n",
		 webkit_get_major_version (),
		 webkit_get_minor_version (),
		 webkit_get_micro_version ());

	return 0;
}
