import { Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform } from 'react-native';

type ExternalLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
};

export function ExternalLink({ href, ...rest }: ExternalLinkProps) {
  return (
    // <Link
    //   href={href}
    //   target="_blank"
    //   {...rest}
    //   onPress={async (e) => {
    //     if (Platform.OS !== 'web') {
    //       e.preventDefault();
    //       await openBrowserAsync(href);
    //     }
    //   }}
    // />
    <></>
  );
}