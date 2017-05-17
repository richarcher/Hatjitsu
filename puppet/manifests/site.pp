# site.pp

exec { 'update':
	command => '/usr/bin/apt-get update',
}
package { 'npm':
   ensure => installed,
   require => Exec['update'],
}
package { 'git':
   ensure => installed,
   require => Package['npm'],
}
exec { 'clone':
   command => '/usr/bin/git clone https://github.com/richarcher/Hatjitsu /usr/local/hatjitsu',
   cwd => '/usr/local/',
   creates => '/usr/local/hatjitsu',
   require => Package['git'],
}
exec { 'install':
   command => '/usr/bin/npm install -d',
   cwd => '/usr/local/hatjitsu',
   require => Exec['clone'],
}
exec { 'run':
   command => '/usr/bin/node server',
   cwd => '/usr/local/hatjitsu',
   require => Exec['install'],
}
